import {Configuration} from '@apttus/core';

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
  maxBufferSize: 5,
  disableBuffer: false,
  subqueryLimit: 10,
  disableCache: false,
  encryptResponse: false,
  cartRetryLimit: 3,
  productIdentifier: 'Id',
  type: 'Salesforce',
  debounceTime: 1000,
  useIndexedDB: true,
  expandDepth: 7,
  hashRouting: false,

  // Salesforce environment variables
  storefront: 'P-Commerce',
  sentryDsn: 'https://6ad10246235742dc89f89b4c3f53f4aa@sentry.io/1230495',
  organizationId: '00D3I0000008n7g',
  endpoint: 'https://dc4-cpqqacommunity1.cs123.force.com/pcom'
};
