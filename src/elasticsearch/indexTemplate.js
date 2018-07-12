import config from '../config';

export default {
  index_patterns: [config.indexName],
  mappings: {
    [config.docType]: {
      properties: {
        deleted: {
          type: 'boolean',
        },
        seq: {
          type: 'integer',
        },
        name: {
          type: 'keyword',
        },
        version: {
          type: 'keyword',
        },
        description: {
          type: 'text',
        },
        repository: {
          properties: {
            url: {
              type: 'keyword',
            },
            type: {
              type: 'keyword',
            },
          },
        },
        license: {
          properties: {
            url: {
              type: 'keyword',
            },
            type: {
              type: 'keyword',
            },
          },
        },
        dependencies: {
          type: 'keyword',
        },
        dependenciesWithVersions: {
          type: 'nested',
          properties: {
            name: {
              type: 'keyword',
            },
            version: {
              type: 'keyword',
            },
          },
        },
        devDependencies: {
          type: 'keyword',
        },
        devDependenciesWithVersions: {
          type: 'nested',
          properties: {
            name: {
              type: 'keyword',
            },
            version: {
              type: 'keyword',
            },
          },
        },
        homepage: {
          properties: {
            url: {
              type: 'keyword',
            },
          },
        },
        versions: {
          type: 'nested',
          properties: {
            number: {
              type: 'keyword',
            },
            date: {
              type: 'date',
            },
          },
        },
        readme: {
          type: 'text',
        },
        created: {
          type: 'date',
        },
        modified: {
          type: 'date',
        },
        lastPublisher: {
          properties: {
            name: {
              type: 'keyword',
            },
            email: {
              type: 'keyword',
            },
          },
        },
        owners: {
          type: 'nested',
          properties: {
            name: {
              type: 'keyword',
            },
            email: {
              type: 'keyword',
            },
          },
        },
      },
    },
  },
};
