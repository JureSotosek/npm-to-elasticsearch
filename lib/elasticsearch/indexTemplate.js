'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  index_patterns: [_config2.default.indexName],
  mappings: {
    [_config2.default.docType]: {
      properties: {
        source: {
          type: 'keyword'
        },
        deleted: {
          type: 'boolean'
        },
        seq: {
          type: 'integer'
        },
        name: {
          type: 'keyword'
        },
        version: {
          type: 'keyword'
        },
        dependencies: {
          type: 'keyword'
        },
        expandedDependencies: {
          type: 'keyword'
        },
        dependenciesWithVersions: {
          type: 'nested',
          properties: {
            name: {
              type: 'keyword'
            },
            version: {
              type: 'keyword'
            }
          }
        },
        devDependencies: {
          type: 'keyword'
        },
        expandedDevDependencies: {
          type: 'keyword'
        },
        devDependenciesWithVersions: {
          type: 'nested',
          properties: {
            name: {
              type: 'keyword'
            },
            version: {
              type: 'keyword'
            }
          }
        },
        allDependencies: {
          type: 'keyword'
        }
      }
    }
  }
};