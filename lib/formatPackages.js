'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nicePackage = require('nice-package');

var _nicePackage2 = _interopRequireDefault(_nicePackage);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (pkgs) {
    const validPkgs = pkgs.filter(function (pkg) {
      return pkg.doc.name !== undefined;
    });

    return validPkgs.map(function (pkg) {
      const niceDoc = new _nicePackage2.default(pkg.doc);

      const dependencies = niceDoc.dependencies ? Object.keys(niceDoc.dependencies) : [];

      const dependenciesWithVersions = niceDoc.dependencies ? Object.keys(niceDoc.dependencies).map(function (key) {
        return { name: key, version: niceDoc.dependencies[key] };
      }) : [];

      const devDependencies = niceDoc.devDependencies ? Object.keys(niceDoc.devDependencies) : [];

      const devDependenciesWithVersions = niceDoc.devDependencies ? Object.keys(niceDoc.devDependencies).map(function (key) {
        return { name: key, version: niceDoc.devDependencies[key] };
      }) : [];

      const allDependencies = dependencies.concat(devDependencies);

      return {
        source: 'npm',
        deleted: pkg.deleted || false,
        seq: pkg.seq,
        name: niceDoc.name,
        version: niceDoc.version || null,
        dependencies,
        dependenciesWithVersions: _config2.default.includeVersions ? dependenciesWithVersions : null,
        devDependencies,
        devDependenciesWithVersions: _config2.default.includeVersions ? devDependenciesWithVersions : null,
        allDependencies
      };
    });
  });

  function formatPackages(_x) {
    return _ref.apply(this, arguments);
  }

  return formatPackages;
})();