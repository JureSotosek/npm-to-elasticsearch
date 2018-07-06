import concatMap from 'concat-map';
import nicePackage from 'nice-package';
import getClient from './elasticsearch/client';
import config from './config';

export default async function indexPackages(pkgs) {
  const docs = formatPackages(pkgs);

  console.log(`Indexing ${pkgs.length} packages.`);

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
      console.log(`Successfully indexed ${pkgs.length} packages.`);
    })
    .catch(error => {
      console.log('Failed indexing with error:', error);
    });
}

function formatPackages(pkgs) {
  return pkgs.map(pkg => {
    const niceDoc = new nicePackage(pkg.doc);

    return {
      seq: pkg.seq,
      name: niceDoc.name,
      version: niceDoc.version || null,
      description: niceDoc.description || null,
      repository: niceDoc.repository
        ? {
            url: niceDoc.repository.url || null,
            type: niceDoc.repository.type || null,
          }
        : null,
      license: niceDoc.license
        ? {
            url: niceDoc.license.url || null,
            type: niceDoc.license.type || null,
          }
        : null,
      dependencies: niceDoc.dependencies
        ? Object.keys(niceDoc.dependencies)
        : [],
      dependenciesWithVersions: niceDoc.dependencies
        ? Object.keys(niceDoc.dependencies).map(key => {
            return { name: key, version: niceDoc.dependencies[key] };
          })
        : [],
      devDependencies: niceDoc.devDependencies
        ? Object.keys(niceDoc.devDependencies)
        : [],
      devDependenciesWithVersions: niceDoc.devDependencies
        ? Object.keys(niceDoc.devDependencies).map(key => {
            return { name: key, version: niceDoc.devDependencies[key] };
          })
        : [],
      homepage: niceDoc.homepage
        ? {
            url: niceDoc.homepage.url || null,
          }
        : null,
      //versions: niceDoc.versions || null,
      readme: niceDoc.readme || null,
      created: niceDoc.created || null,
      modified: niceDoc.modified || null,
      lastPublisher: niceDoc.lastPublisher || null,
      owners: niceDoc.owners || null,
    };
  });
}
