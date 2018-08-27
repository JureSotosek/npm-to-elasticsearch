'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let expandDependenciesLoop = (() => {
  var _ref3 = _asyncToGenerator(function* (newDependencies, existingDependencies) {
    const client = yield (0, _client2.default)();

    const newExistingDependencies = [...existingDependencies, ...newDependencies];

    return new Promise(function (resolve, reject) {
      client.mget({
        index: _config2.default.indexName,
        type: _config2.default.docType,
        body: {
          ids: newDependencies
        }
      }).then((() => {
        var _ref4 = _asyncToGenerator(function* (res) {
          const foundDependencies = res.docs.filter(function (dependency) {
            return dependency.found;
          });
          const newNewDependencies = (0, _concatMap2.default)(foundDependencies, function (dependency) {
            return dependency._source.dependencies;
          }).filter(function (dependency) {
            return !newExistingDependencies.includes(dependency);
          });
          resolve((yield expandDependenciesLoop(newNewDependencies, newExistingDependencies)));
        });

        return function (_x6) {
          return _ref4.apply(this, arguments);
        };
      })()).catch(function (err) {
        resolve(newExistingDependencies);
      });
    });
  });

  return function expandDependenciesLoop(_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
})();

var _concatMap = require('concat-map');

var _concatMap2 = _interopRequireDefault(_concatMap);

var _formatPackages = require('./formatPackages');

var _formatPackages2 = _interopRequireDefault(_formatPackages);

var _client = require('./elasticsearch/client');

var _client2 = _interopRequireDefault(_client);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (pkgs, expandDependencies) {
    const docs = yield (0, _formatPackages2.default)(pkgs);

    if (docs.length === 0) {
      console.log('🔍 No pkgs found in response.');
      return;
    }

    const expandedDocsPromises = docs.map((() => {
      var _ref2 = _asyncToGenerator(function* (doc) {
        if (expandDependencies) {
          const expandedDependencies = yield expandDependenciesLoop(doc.dependencies, []);
          const expandedDevDependencies = yield expandDependenciesLoop(doc.devDependencies, []);
          return _extends({}, doc, {
            expandedDependencies: expandedDependencies,
            expandedDevDependencies: expandedDevDependencies
          });
        } else {
          return doc;
        }
      });

      return function (_x3) {
        return _ref2.apply(this, arguments);
      };
    })());

    const expandedDocs = yield Promise.all(expandedDocsPromises);

    console.log(`📎 Indexing ${expandedDocs.length} packages`);

    const bulkBody = (0, _concatMap2.default)(expandedDocs, function (doc) {
      return [{
        index: {
          _index: _config2.default.indexName,
          _type: _config2.default.docType
        }
      }, _extends({}, doc)];
    });

    const client = yield (0, _client2.default)();

    yield client.bulk({
      body: bulkBody
    }).then(function (res) {
      console.log(`📌 Successfully indexed`);
    }).catch(function (error) {
      console.log('🚨 Failed indexing with error:', error);
    });
  });

  function indexPackages(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return indexPackages;
})();