# 👨🏼‍💻emma-replicator👬

npm to Elasticsearch replication tool.

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
yarn test
```

## Env variables

See [config.js](./config.js):

- `ELASTICSEARCH_ENDPOINT`: elasticsearch instance url
- `ELASTICSEARCH_USER`: elasticsearch instance username
- `ELASTICSEARCH_PASSWORD`: elasticsearch instance password

## License

MIT © [Jure Sotošek](https://github.com/juresotosek)
