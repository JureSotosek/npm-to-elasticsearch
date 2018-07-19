import PouchDB from 'pouchdb';
import cargo from 'async/cargo';
import getClient from './elasticsearch/client';
import indexPackages from './indexPackages';
import { getLastSeq } from './npm';
import config from './config';

const npmRegistry = new PouchDB(config.npmRegistryEndpoint);

const defaultOptions = {
  include_docs: true,
  conflicts: false,
  attachments: false,
};

const indexQueue = cargo((pkgs, done) => {
  indexPackages(pkgs, config.expandDependencies)
    .then(done)
    .catch(done);
}, config.catchUpToChangesBatchSize);

async function main() {
  //init elasticsearch client
  await getClient();

  //get the last trusted seq
  const lastSeqAtBootstrap = await getLastSeq();

  //bootstrap
  if (config.bootstrap) {
    await bootstrap(config.lastBootstrapedId, false);
  }

  //expand dependencies
  if (config.expandDependencies) {
    await bootstrap(config.lastBootstrapedId, true);
  }

  //Catch up with changes that were missed
  const catchUpto = await getLastSeq();
  await catchUpWithChanges(lastSeqAtBootstrap, catchUpto);

  //keep track changes withouth bootstrap
  await trackChanges(config.caughtUpTo || catchUpto);
}

main().catch(error);

async function bootstrap(lastBootstrapedId, expandDependencies) {
  console.log('🚀 Starting the bootstrap!');

  await bootstrapLoop(lastBootstrapedId, 0);

  async function bootstrapLoop(lastId, numberOfDocumentsBootstraped) {
    console.log(
      `🙄 ${expandDependencies ? 'Expanding' : 'Bootstraping'} ${
        config.bootstrapBatchSize
      } docs from doc number ${numberOfDocumentsBootstraped} of id: ${lastId}`
    );

    const options =
      lastId === undefined
        ? {}
        : {
            startkey: lastId,
            skip: 1,
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

        await indexPackages(res.rows, expandDependencies);
        return bootstrapLoop(
          newLastId,
          numberOfDocumentsBootstraped + config.bootstrapBatchSize
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

    changes.on('change', change => {
      if (change.seq > catchUpto) {
        console.log('🏃🏼 Caught up with changes');
        changes.cancel();
        return;
      }
      if (change.deleted) {
        console.log(
          `🤷🏼‍ Seq: ${change.seq}: ${
            change.doc.name
          } has been deleted but will be kept in the database`
        );
      } else {
        console.log(
          `⚙️ Seq: ${change.seq}: ${change.doc.name} has been added/changed`
        );
        indexQueue.push(change, err => {
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

  return new Promise((resolve, reject) => {
    const changes = npmRegistry.changes({
      ...defaultOptions,
      since: caughtUpTo || 0,
      live: true,
      batch_size: 1,
      return_docs: false,
    });

    changes.on('change', change => {
      if (change.deleted) {
        console.log(
          `🤷🏼‍ Seq: ${change.seq}: ${
            change.doc.name
          } has been deleted but will be kept in database`
        );
      } else {
        console.log(
          `⚙️ Seq: ${change.seq}: ${change.doc.name} has been added/changed`
        );
        indexQueue.push(change, err => {
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
