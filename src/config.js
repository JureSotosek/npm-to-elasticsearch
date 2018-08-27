import { config } from 'dotenv';
config();

const defaultConfig = {
  npmRegistryEndpoint: 'https://replicate.npmjs.com/registry',

  elasticsearchEndpoint:
    'https://randomnumbersandletters.us-east-1.aws.found.io:9243/',
  user: 'elastic',
  password: '',
  indexName: 'npm-registry',
  docType: '_doc',
  indexingForTheFirstTime: true,
  bootstrap: true,
  expandDependencies: false,
  lastBootstrapedId: undefined,
  bootstrapBatchSize: 25,
  catchUpToChangesBatchSize: 25,
  caughtUpTo: undefined,
  includeVersions: true,
};

export default Object.entries(defaultConfig).reduce(
  (res, [key, defaultValue]) => ({
    ...res,
    [key]:
      key in process.env
        ? JSON.parse(
            typeof defaultValue === 'string'
              ? `"${process.env[key]}"`
              : process.env[key]
          )
        : defaultValue,
  }),
  {}
);
