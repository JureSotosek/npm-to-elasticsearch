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
      },
    },
  },
};
