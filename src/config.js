import { config } from 'dotenv';
config();

export default {
  npmRegistryEndpoint: 'https://replicate.npmjs.com/registry',

  elasticsearchEndpoint: process.env.ELASTICSEARCH_ENDPOINT,
  user: process.env.ELASTICSEARCH_USER,
  password: process.env.ELASTICSEARCH_PASSWORD,
  indexName: 'npm-registry-test',
  docType: '_doc',
  indexingForTheFirstTime: true,
  bootstrap: true,
  lastBootstrapedId: undefined,
  bootstrapBatchSize: 25,
  catchUpToChangesBatchSize: 25,
  caughtUpTo: undefined,
};
