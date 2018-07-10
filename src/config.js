import { config } from 'dotenv';
config();

export default {
  npmRegistryEndpoint: 'https://replicate.npmjs.com/registry',

  elasticSearchEndpoint:
    'https://bc62ddde33c94b1e8d13ef529d16ec21.us-east-1.aws.found.io:9243',
  user: 'elastic',
  password: 'n3UOpLkY73Du8T4Dg5agvCg5',
  //if you change the indexName you also have to change the "index-patterns"
  //field in the ./elasticsearch/indexTemplate.json file to match it
  indexName: 'npm-registry-test2',
  docType: '_doc',
  indexingForTheFirstTime: true,
  bootstrap: false,
  lastBootstrapedId: undefined,
  bootstrapBatchSize: 25,
  catchUpToChangesBatchSize: 25,
  caughtUpTo: 5478935,
};
