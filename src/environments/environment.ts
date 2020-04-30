import { Configuration } from '@apttus/core';

export const environment: Configuration = {
  production: false,
  defaultImageSrc: './assets/images/default.png',
  defaultCountry: 'US',
  defaultLanguage: 'en-US',
  enableErrorLogging: true,
  enableErrorReporting: true,
  enableMultiCurrency: false,
  enableQueryLogs: true,
  enablePerformanceLogs: true,
  defaultCurrency: 'USD',
  bufferTime: 10,
  maxBufferSize: 10,
  disableBuffer: false,
  subqueryLimit: 10,
  disableCache: false,
  encryptResponse: false,
  cartRetryLimit: 10,
  productIdentifier: 'Id',
  type: 'Salesforce',
  debounceTime: 1000,
  useIndexedDB: false,
  expandDepth: 7,
  hashRouting: false,

  // Salesforce environment variables
  storefront: 'Partner Commerce',
  endpoint: 'https://apttusdc-developer-edition.na134.force.com/partner'
};
