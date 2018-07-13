# 👨🏼‍💻emma-replicator👬

npm to Elasticsearch replication tool

*this code base was very much inspired and is modeled after Algolia's [npm-search](https://github.com/algolia/npm-search)

## Overview

This is a failure resilient npm registry to Elasticsearch index replication process.
It will replicate all npm packages to an Elasticsearch index and keep it up to date.

The replication should always be running.
If the process fails, restart but input correct values in to the config.

## Development

```sh
yarn dev
```

## Production

```sh
yarn build
yarn start
```

## Env variables

See [config.js](./config.js):

- `ELASTICSEARCH_ENDPOINT`: elasticsearch instance url
- `ELASTICSEARCH_USER`: elasticsearch instance username
- `ELASTICSEARCH_PASSWORD`: elasticsearch instance password

## License

MIT [Jure Sotošek](https://github.com/juresotosek)

MIT [Algolia](Algolia.com), Inc
