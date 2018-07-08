import PouchDB from 'pouchdb';
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
    //keep track of further changes
    await trackChanges(lastSeqAtBootstrap);
  }
  //keep track changes withouth bootstrap
  await trackChanges(config.caughtUpTo || 0);
}

main().catch(error);

async function bootstrap(lastBootstrapedId) {
  console.log('🏃🏼 Starting the bootstrap!');

  await bootstrapSinceLastId(lastBootstrapedId, 0);

  async function bootstrapSinceLastId(lastId, numberOfDocumentsBootstraped) {
    console.log(
      `🙄 Boostraping ${
        config.bootstrapBatchSize
      } docs from doc number ${numberOfDocumentsBootstraped} of Id: ${lastId}`
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

        return indexPackages(res.rows).then(() =>
          bootstrapSinceLastId(
            newLastId,
            numberOfDocumentsBootstraped + config.bootstrapBatchSize
          )
        );
      });
  }
}

async function trackChanges(caughtUpTo) {
  console.log('👀 Live tracking of changes has started');

  if (caughtUpTo === undefined || caughtUpTo === null) {
    throw 'Field "caughtUpTo" in config not supplied';
  }

  return new Promise((resolve, reject) => {
    const changes = npmRegistry.changes({
      ...defaultOptions,
      since: caughtUpTo,
      live: true,
      batch_size: 1,
      include_docs: true,
    });

    changes.on('change', change => {
      if (change.deleted) {
        console.log(
          `🤷🏼‍ Document: ${
            change.doc.id
          } has been deleted but will be kept in database`
        );
      } else {
        console.log(`⚙️ Document: ${change.doc.name} has been added/changed`);
        indexPackages([change]);
      }
    });

    changes.on('error', reject);
  });
}

function error(err) {
  console.error('Error:', err);
  process.exit(1);
}
