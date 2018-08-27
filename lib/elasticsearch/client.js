'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

let putTemplate = (() => {
  var _ref2 = _asyncToGenerator(function* (client) {
    yield client.indices.putTemplate({
      name: 'npm-registry',
      body: _indexTemplate2.default
    });
  });

  return function putTemplate(_x) {
    return _ref2.apply(this, arguments);
  };
})();

var _elasticsearch = require('elasticsearch');

var _elasticsearch2 = _interopRequireDefault(_elasticsearch);

var _indexTemplate = require('./indexTemplate');

var _indexTemplate2 = _interopRequireDefault(_indexTemplate);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let client;

exports.default = (() => {
  var _ref = _asyncToGenerator(function* () {
    if (client) {
      return client;
    }

    if (!_config2.default.elasticsearchEndpoint || !_config2.default.user || !_config2.default.password) {
      throw 'Config not set correctly';
    }

    client = new _elasticsearch2.default.Client({
      host: _config2.default.elasticsearchEndpoint,
      httpAuth: `${_config2.default.user}:${_config2.default.password}`
    });

    if (_config2.default.indexingForTheFirstTime) {
      yield client.indices.get({ index: _config2.default.indexName }).then(function () {
        console.log('🗑 Deleting index:', _config2.default.indexName);
        client.indices.delete({ index: _config2.default.indexName });
      }).catch(function () {});
      yield putTemplate(client);
      yield client.indices.create({ index: _config2.default.indexName });
    }

    return client;
  });

  function getClient() {
    return _ref.apply(this, arguments);
  }

  return getClient;
})();