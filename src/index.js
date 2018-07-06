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
    const lastSeq = await getLastSeq();
    //index all the already existing documents
    await bootstrap();
    //keep track of further changes
    await trackChanges(lastSeq);
  } else {
    await trackChanges(config.caughtUpTo || 0);
  }
}

main().catch(error);

async function bootstrap() {
  console.log('Starting the bootstrap!');

  await bootstrapSinceLastId(undefined, 0);

  async function bootstrapSinceLastId(lastId, numberOfDocumentsBootstraped) {
    console.log(
      `Boostraped ${numberOfDocumentsBootstraped} documents until id: ${lastId}!`
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
          console.log('Bootstrap done!');
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
  console.log('Live tracking of changes has started!');

  return new Promise((resolve, reject) => {
    const changes = npmRegistry.changes({
      include_docs: true,
      live: true,
      since: caughtUpTo,
      batch_size: 1,
    });

    changes.on('change', change => {
      indexPackages([change]);
    });

    changes.on('error', reject);
  });
}

function error(err) {
  console.error(err);
  process.exit(1);
}
