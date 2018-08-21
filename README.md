# 👨🏼‍💻npm-to-elasticsearch👬

npm to Elasticsearch replication tool

This code base was very much inspired and is modeled after [Algolia's](https://www.algolia.com/) [npm-search](https://github.com/algolia/npm-search)

## Overview

This is a failure resilient npm registry to Elasticsearch index replication process.
It will replicate all npm packages to an Elasticsearch index and keep it up to date.

It was primeraly made to be the source of suggestions for [npm-suggestions](https://github.com/juresotosek/npm-suggestions).

The replication should always be running.
If the process fails, restart but set correct values as env variables. Config values from the [config](./src/config.js) file get overwriten by the env variables with the same name.

## Development

```sh
yarn dev
```

## Production

```sh
yarn build
yarn start
```

## Document format

TODO

## Env variables

See [config.js](./config.js):

### Required:

- `elasticsearch_endpoint`: elasticsearch instance url
- `user`: elasticsearch instance username
- `password`: elasticsearch instance password

### Other:

- `npmRegistryEndpoint` - default: `https://replicate.npmjs.com/registry` npm registry url
- `indexName` - default: `npm-registry` name of the elasticsearch index
- `docType` - default: `_doc` doc type of documents in elasticsearch index
- `indexingForTheFirstTime` - default: `false` bool value, if index should be initialized, templates set
- `bootstrap` - default: `true` bool value, should bootstrap happen
- `expandDependencies` - default: `false` bool value, should docs include expandedDependencies
- `lastBootstrapedId` - default: `undefined` last bootstraped id
- `bootstrapBatchSize` - default: `25` how many documents to index at a time, reduce this value if you are having memory problems
- `catchUpToChangesBatchSize` - default: `25` how many changes to index at a time, reduce this value if you are having memory problems
- `caughtUpTo` - default: `undefined` the seq your index is caught up to

## License

MIT © [Jure Sotošek](https://github.com/juresotosek)

MIT © [Algolia](Algolia.com), Inc
