import elasticsearch from 'elasticsearch';
import indexTemplate from './indexTemplate.json';
import config from '../config';

let client = null;

export default async function getClient() {
  if (client) {
    return client;
  }

  client = new elasticsearch.Client({
    host: config.elasticSearchEndpoint,
    httpAuth: `${config.user}:${config.password}`,
  });

  if (config.indexingForTheFirstTime) {
    await client.indices.delete({ index: config.indexName });
    await putTemplate(client);
  }

  return client;
}

async function putTemplate(client) {
  await client.indices.putTemplate({
    name: 'npm-registry',
    body: indexTemplate,
  });
}
