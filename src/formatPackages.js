import nicePackage from 'nice-package';

import config from './config';

export default async function formatPackages(pkgs) {
  const validPkgs = pkgs.filter(pkg => {
    return pkg.doc.name !== undefined;
  });

  return validPkgs.map(pkg => {
    const niceDoc = new nicePackage(pkg.doc);

    const dependencies = niceDoc.dependencies
      ? Object.keys(niceDoc.dependencies)
      : [];

    const dependenciesWithVersions = config.includeVersions
      ? niceDoc.dependencies
        ? Object.keys(niceDoc.dependencies).map(key => {
            return { name: key, version: niceDoc.dependencies[key] };
          })
        : null
      : null;

    const devDependencies = niceDoc.devDependencies
      ? Object.keys(niceDoc.devDependencies)
      : [];

    const devDependenciesWithVersions = config.includeVersions
      ? niceDoc.devDependencies
        ? Object.keys(niceDoc.devDependencies).map(key => {
            return { name: key, version: niceDoc.devDependencies[key] };
          })
        : null
      : null;

    const allDependencies = dependencies.concat(devDependencies);

    return {
      source: 'npm',
      deleted: pkg.deleted || false,
      seq: pkg.seq,
      name: niceDoc.name,
      version: niceDoc.version || null,
      dependencies,
      dependenciesWithVersions,
      devDependencies,
      devDependenciesWithVersions,
      allDependencies,
    };
  });
}
