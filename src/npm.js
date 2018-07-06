import got from 'got';
import config from './config.js';

export function getLastSeq() {
  return got(config.npmRegistryEndpoint, {
    json: true,
  }).then(({ body: { update_seq: lastSeq } }) => {
    lastSeq;
  });
}
