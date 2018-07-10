import concatMap from 'concat-map';
import formatPackages from './formatPackages';
import getClient from './elasticsearch/client';
import config from './config';

export default async function indexPackages(pkgs) {
  const docs = formatPackages(pkgs);

  if (docs.length === 0) {
    console.log('🔍 No pkgs found in response.');
    return;
  }

  console.log(`📎 Indexing ${docs.length} packages`);

  const bulkBody = concatMap(docs, doc => {
    return [
      {
        index: {
          _index: config.indexName,
          _type: config.docType,
          _id: doc.name,
        },
      },
      {
        ...doc,
      },
    ];
  });

  const client = await getClient();

  await client
    .bulk({
      body: bulkBody,
    })
    .then(res => {
      console.log(`📌 Successfully indexed`);
    })
    .catch(error => {
      console.log('🚨 Failed indexing with error:', error);
    });
}
