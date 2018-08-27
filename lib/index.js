'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let main = (() => {
  var _ref = _asyncToGenerator(function* () {
    //init elasticsearch client
    yield (0, _client2.default)();
    //get the last trusted seq
    const lastSeqAtBootstrap = yield (0, _npm.getLastSeq)();
    //bootstrap
    if (_config2.default.bootstrap) {
      yield bootstrap(_config2.default.lastBootstrapedId, false);
    }
    //expand dependencies
    if (_config2.default.expandDependencies) {
      yield bootstrap(_config2.default.lastBootstrapedId, true);
    }
    //Catch up with changes that were missed
    const catchUpto = yield (0, _npm.getLastSeq)();
    yield catchUpWithChanges(lastSeqAtBootstrap, catchUpto);
    //keep track changes withouth bootstrap
    yield trackChanges(_config2.default.caughtUpTo || catchUpto);
  });

  return function main() {
    return _ref.apply(this, arguments);
  };
})();

let bootstrap = (() => {
  var _ref2 = _asyncToGenerator(function* (lastBootstrapedId, expandDependencies) {
    let bootstrapLoop = (() => {
      var _ref3 = _asyncToGenerator(function* (lastId, numberOfDocumentsBootstraped) {
        console.log(`🙄 ${expandDependencies ? 'Expanding' : 'Bootstraping'} ${_config2.default.bootstrapBatchSize} docs from doc number ${numberOfDocumentsBootstraped} of id: ${lastId}`);

        const options = lastId === undefined ? {} : {
          startkey: lastId,
          skip: 1
        };

        return npmRegistry.allDocs(_extends({}, defaultOptions, options, {
          limit: _config2.default.bootstrapBatchSize
        })).then((() => {
          var _ref4 = _asyncToGenerator(function* (res) {
            if (res.rows.length === 0) {
              console.log('🎉 Bootstrap done');
              return;
            }

            const newLastId = res.rows[res.rows.length - 1].id;

            yield (0, _indexPackages2.default)(res.rows, expandDependencies);
            return bootstrapLoop(newLastId, numberOfDocumentsBootstraped + _config2.default.bootstrapBatchSize);
          });

          return function (_x5) {
            return _ref4.apply(this, arguments);
          };
        })());
      });

      return function bootstrapLoop(_x3, _x4) {
        return _ref3.apply(this, arguments);
      };
    })();

    console.log(`🚀 Starting the ${expandDependencies ? 'expansion of dependencies' : 'bootstrap'}!`);

    yield bootstrapLoop(lastBootstrapedId, 0);
  });

  return function bootstrap(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
})();

let catchUpWithChanges = (() => {
  var _ref5 = _asyncToGenerator(function* (lastSeqAtBootstrap, catchUpto) {
    console.log(`🏎 Catching up with missed changes from seq: ${lastSeqAtBootstrap} to seq: ${catchUpto}`);

    return new Promise(function (resolve, reject) {
      const changes = npmRegistry.changes(_extends({}, defaultOptions, {
        since: lastSeqAtBootstrap,
        batch_size: _config2.default.catchUpToChangesBatchSize,
        live: true,
        return_docs: false
      }));

      changes.on('change', function (change) {
        if (change.seq > catchUpto) {
          console.log('🏃🏼 Caught up with changes');
          changes.cancel();
          return;
        }
        if (change.deleted) {
          console.log(`🤷🏼‍ Seq: ${change.seq}: ${change.doc.name} has been deleted but will be kept in the database`);
        } else {
          console.log(`⚙️ Seq: ${change.seq}: ${change.doc.name} has been added/changed`);
          indexQueue.push(change, function (err) {
            if (err) {
              reject(err);
            }
          });
        }
      });
      changes.on('complete', resolve); // Called when cancel() called
      changes.on('error', reject);
    });
  });

  return function catchUpWithChanges(_x6, _x7) {
    return _ref5.apply(this, arguments);
  };
})();

let trackChanges = (() => {
  var _ref6 = _asyncToGenerator(function* (caughtUpTo) {
    console.log(`👀 Live tracking of changes since seq: ${caughtUpTo} has started`);

    return new Promise(function (resolve, reject) {
      const changes = npmRegistry.changes(_extends({}, defaultOptions, {
        since: caughtUpTo || 0,
        live: true,
        batch_size: 1,
        return_docs: false
      }));

      changes.on('change', function (change) {
        if (change.deleted) {
          console.log(`🤷🏼‍ Seq: ${change.seq}: ${change.doc.name} has been deleted but will be kept in database`);
        } else {
          console.log(`⚙️ Seq: ${change.seq}: ${change.doc.name} has been added/changed`);
          indexQueue.push(change, function (err) {
            if (err) {
              reject(err);
            }
          });
        }
      });

      changes.on('error', reject);
    });
  });

  return function trackChanges(_x8) {
    return _ref6.apply(this, arguments);
  };
})();

var _pouchdb = require('pouchdb');

var _pouchdb2 = _interopRequireDefault(_pouchdb);

var _cargo = require('async/cargo');

var _cargo2 = _interopRequireDefault(_cargo);

var _client = require('./elasticsearch/client');

var _client2 = _interopRequireDefault(_client);

var _indexPackages = require('./indexPackages');

var _indexPackages2 = _interopRequireDefault(_indexPackages);

var _npm = require('./npm');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const npmRegistry = new _pouchdb2.default(_config2.default.npmRegistryEndpoint);

const defaultOptions = {
  include_docs: true,
  conflicts: false,
  attachments: false
};

const indexQueue = (0, _cargo2.default)((pkgs, done) => {
  (0, _indexPackages2.default)(pkgs, _config2.default.expandDependencies).then(done).catch(done);
}, _config2.default.catchUpToChangesBatchSize);

main().catch(error);

function error(err) {
  console.error('Error:', err);
  process.exit(1);
}