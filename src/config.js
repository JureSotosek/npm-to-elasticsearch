import { config } from 'dotenv';
config();

export default {
  npmRegistryEndpoint: 'https://replicate.npmjs.com/registry',

  elasticSearchEndpoint:
    'https://bc62ddde33c94b1e8d13ef529d16ec21.us-east-1.aws.found.io:9243',
  user: 'elastic',
  password: 'n3UOpLkY73Du8T4Dg5agvCg5',
  indexName: 'npm-registry',
  docType: '_doc',
  bootstrap: true,
  caughtUpTo: null,
  bootstrapBatchSize: 200,
};
