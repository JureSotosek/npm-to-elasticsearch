import PouchDB from 'pouchdb';
import indexPackage from './indexPackages';
import config from './config';

const npm = new PouchDB('https://replicate.npmjs.com/registry');

async function main() {
  //index all the unindexed documents in bulk
  const caughtUpTo = await catchUpWithChanged();
  //index changes as they happen
  await trackChanges(caughtUpTo);
}

main().catch(error);

async function catchUpWithChanged() {
  console.log('Starting to catch up with changes!');

  return new Promise((resolve, reject) => {
    const changes = npm.changes({
      include_docs: true,
      since: config.catchUpSince,
      batch_size: config.batchSize,
    });

    changes.on('change', change => {
      indexPackage(change);
    });

    changes.on('complete', info => {
      resolve(info.last_seq);
    });

    changes.on('error', reject);
  });
}

async function trackChanges(caughtUpTo) {
  console.log('Live tracking of changes has started!');

  return new Promise((resolve, reject) => {
    const changes = npm.changes({
      include_docs: true,
      live: true,
      since: caughtUpTo,
      batch_size: 1,
    });

    changes.on('change', change => {
      indexPackage(change);
    });

    changes.on('error', reject);
  });
}

function error(err) {
  console.error(err);
  process.exit(1);
}
