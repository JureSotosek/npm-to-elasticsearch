import nicePackage from 'nice-package';

export default function formatPackages(pkgs) {
  const validPkgs = pkgs.filter(pkg => {
    return pkg.doc.name !== undefined;
  });

  return validPkgs.map(pkg => {
    const niceDoc = new nicePackage(pkg.doc);

    return {
      deleted: pkg.deleted || false,
      seq: pkg.seq,
      name: niceDoc.name,
      version: niceDoc.version || null,
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
      versions: niceDoc.versions || null,
    };
  });
}
