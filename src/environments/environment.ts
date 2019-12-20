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
  maxBufferSize: 5,
  disableBuffer: false,
  subqueryLimit: 10,
  disableCache: false,
  encryptResponse: false,
  cartRetryLimit: 3,
  productIdentifier: 'Id',
  type: 'Salesforce',
  debounceTime: 1000,
  proxy: 'https://apttus-proxy.herokuapp.com',
  useIndexedDB: true,
  expandDepth: 8,
  hashRouting: false,

  // Salesforce environment variables
  storefront: '****Storefront Name****',
  sentryDsn: '****Sentry URL****',
  organizationId: '****Salesforce Organization Id****',
  endpoint: '****Salesforce Community URL****'
};
