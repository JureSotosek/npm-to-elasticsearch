import nicePackage from 'nice-package';

export default function formatPackages(pkgs) {
  const validPkgs = pkgs.filter(pkg => {
    return pkg.doc.name !== undefined;
  });

  return validPkgs.map(pkg => {
    const niceDoc = new nicePackage(pkg.doc);

    return {
      deleted: pkg.deleted || null,
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
      versions: niceDoc.versions || null,
      readme: niceDoc.readme || null,
      created: niceDoc.created || null,
      modified: niceDoc.modified || null,
      lastPublisher: niceDoc.lastPublisher || null,
      owners: niceDoc.owners || null,
    };
  });
}
