'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _dotenv = require('dotenv');

(0, _dotenv.config)();

const defaultConfig = {
  npmRegistryEndpoint: 'https://replicate.npmjs.com/registry',

  elasticsearchEndpoint: 'https://randomnumbersandletters.us-east-1.aws.found.io:9243/',
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
  includeVersions: true
};

exports.default = Object.entries(defaultConfig).reduce((res, [key, defaultValue]) => _extends({}, res, {
  [key]: key in process.env ? JSON.parse(typeof defaultValue === 'string' ? `"${process.env[key]}"` : process.env[key]) : defaultValue
}), {});