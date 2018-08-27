'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLastSeq = getLastSeq;

var _got = require('got');

var _got2 = _interopRequireDefault(_got);

var _config = require('./config.js');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getLastSeq() {
  return (0, _got2.default)(_config2.default.npmRegistryEndpoint, {
    json: true
  }).then(({ body: { update_seq: lastSeq } }) => lastSeq);
}