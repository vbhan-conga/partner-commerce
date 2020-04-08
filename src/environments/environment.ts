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
  proxy: 'https://apttus-proxy.herokuapp.com',
  hashRouting: false,

  // Salesforce environment variables
  storefront: 'Partner Commerce',
  sentryDsn: 'https://6ad10246235742dc89f89b4c3f53f4aa@sentry.io/1230495',
  organizationId: '00D3I0000008n7g',
  endpoint: 'https://apttusdc-developer-edition.na134.force.com/partner'
  // endpoint: 'https://dc1-cpqqacommunity1.cs2.force.com/ecom',
  // packageNamespace: 'Apttus_WebStore'
};
