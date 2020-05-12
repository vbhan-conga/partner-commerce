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
  // storefront: 'P-Commerce',
  // sentryDsn: 'https://6ad10246235742dc89f89b4c3f53f4aa@sentry.io/1230495',
  // organizationId: '00D3I0000008mFM',
  // endpoint: 'https://dc5-cpqqacommunity1.cs123.force.com/partners'
  storefront: 'Partner Commerce',
  sentryDsn: 'https://6ad10246235742dc89f89b4c3f53f4aa@sentry.io/1230495',
  organizationId: '00DG0000000iqtB',
  endpoint: 'https://apttusdc-developer-edition.na134.force.com/partner'
  // packageNamespace: 'Apttus_WebStore',
  // storefront: 'P-Commerce',
  // organizationId: '00D3I0000008n7g',
  // sentryDsn: 'https://6ad10246235742dc89f89b4c3f53f4aa@sentry.io/1230495',
  // endpoint: 'https://dc4-cpqqacommunity1.cs123.force.com/pcom'
};
