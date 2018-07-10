import elasticsearch from 'elasticsearch';
import indexTemplate from './indexTemplate';
import config from '../config';

let client;

export default async function getClient() {
  if (client) {
    return client;
  }

  client = new elasticsearch.Client({
    host: config.elasticsearchEndpoint,
    httpAuth: `${config.user}:${config.password}`,
  });

  if (config.indexingForTheFirstTime) {
    await client.indices
      .get({ index: config.indexName })
      .then(() => {
        client.indices.delete({ index: config.indexName });
      })
      .catch(() => {});

    await putTemplate(client);
    await client.indices.create({ index: config.indexName });
  }

  return client;
}

async function putTemplate(client) {
  await client.indices.putTemplate({
    name: 'npm-registry',
    body: indexTemplate,
  });
}
