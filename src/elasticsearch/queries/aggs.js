const nestedOneDependencyAggregation = {
  size: 0,
  aggs: {
    dependencies: {
      nested: {
        path: 'dependencies',
      },
      aggs: {
        includesDeps: {
          filter: {
            term: {
              'dependencies.name': 'react',
            },
          },
          aggs: {
            unNested: {
              reverse_nested: {},
              aggs: {
                dependencies: {
                  nested: {
                    path: 'dependencies',
                  },
                  aggs: {
                    mostCommon: {
                      terms: {
                        field: 'dependencies.name',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const oneDependencyAggregation = {
  size: 0,
  aggs: {
    includesDeps: {
      filter: {
        term: {
          dependencies: 'react',
        },
      },
      aggs: {
        mostCommon: {
          terms: {
            field: 'dependencies',
          },
        },
      },
    },
  },
};

const multipleDependencyAggregation = {
  size: 0,
  aggs: {
    includesDeps: {
      filter: {
        bool: {
          must: [
            {
              term: {
                dependencies: 'react',
              },
            },
            {
              term: {
                dependencies: 'react-dom',
              },
            },
          ],
        },
      },
      aggs: {
        mostCommon: {
          terms: {
            field: 'dependencies',
          },
        },
      },
    },
  },
};
