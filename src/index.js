import PouchDB from 'pouchdb';
import cargo from 'async/cargo';
import queue from 'async/queue';
import indexPackages from './indexPackages';
import { getLastSeq } from './npm';
import config from './config';

const npmRegistry = new PouchDB('https://replicate.npmjs.com/registry');

const defaultOptions = {
  include_docs: true,
  conflicts: false,
  attachments: false,
};

async function main() {
  if (config.bootstrap) {
    //get the last trusted seq
    const lastSeqAtBootstrap = await getLastSeq();
    //index all the already existing documents
    await bootstrap(config.lastBootstrapedId);
    //Catch up with changes that were missed
    const seqToCatchUpTo = await getLastSeq();
    await catchUpWithChanges(lastSeqAtBootstrap, seqToCatchUpTo);
    //keep track of further changes
    await trackChanges(seqToCatchUpTo);
  }
  //keep track changes withouth bootstrap
  await trackChanges(config.caughtUpTo || 0);
}

main().catch(error);

async function bootstrap(lastBootstrapedId) {
  console.log('🚀 Starting the bootstrap!');

  await bootstrapLoop(lastBootstrapedId, 0);

  async function bootstrapLoop(lastId, numberOfDocumentsBootstraped) {
    console.log(
      `🙄 Boostraping ${
        config.bootstrapBatchSize
      } docs from doc number ${numberOfDocumentsBootstraped} of id: ${lastId}`
    );

    const options =
      lastId === undefined
        ? {}
        : {
            startkey: lastId,
            skip: 300000,
          };

    return npmRegistry
      .allDocs({
        ...defaultOptions,
        ...options,
        limit: config.bootstrapBatchSize,
      })
      .then(async res => {
        if (res.rows.length === 0) {
          console.log('🎉 Bootstrap done');
          return;
        }

        const newLastId = res.rows[res.rows.length - 1].id;

        return indexPackages(res.rows).then(() =>
          bootstrapLoop(
            newLastId,
            numberOfDocumentsBootstraped + config.bootstrapBatchSize
          )
        );
      });
  }
}

async function catchUpWithChanges(lastSeqAtBootstrap, catchUpto) {
  console.log(
    `🏎 Catching up with missed changes from seq: ${lastSeqAtBootstrap} to seq: ${catchUpto}`
  );

  return new Promise((resolve, reject) => {
    const changes = npmRegistry.changes({
      ...defaultOptions,
      since: lastSeqAtBootstrap,
      batch_size: config.catchUpToChangesBatchSize,
      live: true,
      return_docs: false,
    });

    const q = cargo((pkgs, done) => {
      indexPackages(pkgs)
        .then(() => {
          if (pkgs.pop().seq >= catchUpto) {
            changes.cancel();
          }
        })
        .then(done)
        .catch(done);
    }, config.catchUpToChangesBatchSize);

    changes.on('change', change => {
      if (change.deleted) {
        console.log(
          `🤷🏼‍ Seq: ${change.seq}: ${
            change.doc.id
          } has been deleted but will be kept in the database`
        );
      } else {
        console.log(
          `⚙️ Seq: ${change.seq}: ${change.doc.name} has been added/changed`
        );
        q.push(change, err => {
          if (err) {
            reject(err);
          }
        });
      }
    });
    changes.on('complete', resolve); // Called when cancel() called
    changes.on('error', reject);
  });
}

async function trackChanges(caughtUpTo) {
  console.log(
    `👀 Live tracking of changes since seq: ${caughtUpTo} has started`
  );

  if (caughtUpTo === undefined || caughtUpTo === null) {
    throw 'Field "caughtUpTo" not supplied';
  }

  return new Promise((resolve, reject) => {
    const changes = npmRegistry.changes({
      ...defaultOptions,
      since: caughtUpTo,
      live: true,
      batch_size: 1,
      return_docs: false,
    });

    const q = queue((pkg, done) => {
      indexPackages([pkg])
        .then(done)
        .catch(done);
    }, 1);

    changes.on('change', change => {
      if (change.deleted) {
        console.log(
          `🤷🏼‍ Seq: ${change.seq}: ${
            change.doc.id
          } has been deleted but will be kept in database`
        );
      } else {
        console.log(
          `⚙️ Seq: ${change.seq}: ${change.doc.name} has been added/changed`
        );
        q.push(change, err => {
          if (err) {
            reject(err);
          }
        });
      }
    });

    changes.on('error', reject);
  });
}

function error(err) {
  console.error('Error:', err);
  process.exit(1);
}
