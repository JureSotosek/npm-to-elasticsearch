import concatMap from 'concat-map';
import formatPackages from './formatPackages';
import getClient from './elasticsearch/client';
import config from './config';
import { resolve } from 'dns';
import { rejects } from 'assert';

export default async function indexPackages(pkgs, expandDependencies) {
  const docs = await formatPackages(pkgs);

  if (docs.length === 0) {
    console.log('🔍 No pkgs found in response.');
    return;
  }

  const expandedDocsPromises = docs.map(async doc => {
    if (expandDependencies) {
      const expandedDependencies = await expandDependenciesLoop(
        doc.dependencies,
        []
      );
      const expandedDevDependencies = await expandDependenciesLoop(
        doc.devDependencies,
        []
      );
      return {
        ...doc,
        dependencies: expandedDependencies,
        devDependencies: expandedDevDependencies,
      };
    } else {
      return doc;
    }
  });

  const expandedDocs = await Promise.all(expandedDocsPromises);

  console.log(`📎 Indexing ${expandedDocs.length} packages`);

  const bulkBody = concatMap(expandedDocs, doc => {
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

async function expandDependenciesLoop(newDependencies, existingDependencies) {
  const client = await getClient();

  const newExistingDependencies = [...existingDependencies, ...newDependencies];

  return new Promise((resolve, reject) => {
    client
      .mget({
        index: config.indexName,
        type: config.docType,
        body: {
          ids: newDependencies,
        },
      })
      .then(async res => {
        const foundDependencies = res.docs.filter(
          dependency => dependency.found
        );
        const newNewDependencies = concatMap(
          foundDependencies,
          dependency => dependency._source.dependencies
        ).filter(dependency => !newExistingDependencies.includes(dependency));
        resolve(
          await expandDependenciesLoop(
            newNewDependencies,
            newExistingDependencies
          )
        );
      })
      .catch(err => {
        resolve(newExistingDependencies);
      });
  });
}
