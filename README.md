# Digital Commerce Core Reference Template

This is the base reference application for the conga ecommerce product. Follow the below instructions to get started. See the [docs](https://cmoyle336.github.io/sdk-docs/overview.html) for more detailed instructions on interacting with the underlying SDK.

---
## Table of content 
- [Install the managed package in your org](#install-managed-package)
- [Prerequisites](#prerequisites)
- [Installation](#installation) 
- [Sentry Logging](#sentry-logging)
- [Enable/disable localization](#enabledisable-localization)
- [Debugging](#debugging)
- [Response Encryption](#response-encryption)
- [Product identifier](#product-identifier)
- [Setup the proxy for local development](#setup-the-proxy-for-local-development)
- [Development server](#development-server)
- [Angular command](#code-scaffolding)
- [Build](#build)
- [Running unit tests](#running-unit-tests)
- [Running end-to-end tests](#running-end-to-end-tests)
- [Digital Commerce SDK](#digital-commerce-sdk)
- [Digital Commerce for REST API Developers](#digital-commerce-for-rest-api-developers)
- [Further help](#further-help)

<div id="install-managed-package"/>

## Install the managed package in your org
Login to your org and use the following [link](https://login.salesforce.com/packaging/installPackage.apexp?p0=04to000000047xK) to install the managed package. The managed package requires a password, and you'll need to reach out to an Conga representative to obtain this.

<div id="prerequisites"/>

## Prerequisites
You will need Node js, NPM, and Angular CLI to work with this project
- Node js with NPM  
- Angular 
- Angular CLI 

To make sure you have them available on your machine, try running the following command.

npm -v : To check nodejs version,

node -v : To check NPM version

ng --version : To check Angular CLI version


<div id="installation"/>

## Installation
---
### Platform & tools

You need to install Node.js and then the development tools. Node.js comes with a package manager called [npm](http://npmjs.org) for installing NodeJS applications and libraries.
* [Node.js](http://nodejs.org) 

* [Angular](https://angular.io/docs) 

* [Angular CLI](https://angular.io/cli) 

### Get the Code

Either clone this repository or fork it on GitHub and clone your fork:

```
git clone https://github.com/congacommerce/partner-commerce
```
### Update .npmrc file
To install given SDK version you need to setup auth token in .npmrc file.
1.  "@congacommerce/core": "^2201.0.73",
2.  "@congacommerce/ecommerce": "^2201.0.73",
3.  "@congacommerce/elements": "^2201.0.73",


```
@congacommerce:registry=https://npm.pkg.github.com
npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```
### Dependency installation
To install dependency run npm install command.
```
npm install
```

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Updating the environment file

The last three fields of the environment file will be Replace with details of the Salesforce org

  storefront: 'Storefront Name',

  organizationId: 'Salesforce Org Id',

  endpoint: 'Community Site Url'
  
### Run server

**Development Mode** 

>Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
  
**Production Mode** 

>Run `ng serve --aot` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

<div id="sentry-logging"/>

## Sentry Logging
Sentry will be installed and running and, if you run into errors, you may see a popup asking for feedback. You can disable this in your src/app/salesforce.config.ts file with the following flags:

```json
{
    "enableErrorLogging" : false,
    "enableErrorReporting": false
}
```

<div id="enabledisable-localization"/>

## Enable/disable localization
If you do not have multi-currency enabled in your org, you must turn off multi-currency support in your storefront in the src/app/salesforce.config.ts file.
```json
{
    "enableMultiCurrency" : false
}
```

<div id="debugging"/>

## Debugging
You can add query and performance metrics in the console output using the following parameters in the src/app/salesforce.config.ts file
```json
{
    "enableQueryLogs" : true,
    "enablePerformanceLogs" : true
}
```

<div id="response-encryption"/>

## Response Encryption
You can disable / enable response encryption (recommended enabled) in the src/app/salesforce.config.ts file
```json
{
    "encryptResponse" : true
}
```

<div id="product-identifier"/>

## Product identifier
By default, routing to products in the reference template is dependent on the product code. However, if you wish to use a different field to route to products, you can set the 'productIdentifier' parameter in the config file
to any product field
```json
{
    "productIdentifier" : "ProductCode"
}
```

<div id="setup-the-proxy-for-local-development"/>

## Setup the proxy for local development
In the root directory, there is a file named 'proxy.config.json'. This allows you to make SOAP API calls from your local development server (for functionality like login and reprice cart). Populate the 'target' attributes in that file with the instance url of your community.


<div id="code-scaffolding"/>

## Angular command

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Deploy to your salesforce org
Deploy your Digital Commerce application on your Salesforce Org.

Refer the [docs](https://documentation.conga.com/digital-commerce/december-21/deploying-the-application-to-salesforce-161156294.html)

<div id="running-unit-tests"/>

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

<div id="running-end-to-end-tests"/>

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

<div id="digital-commerce-sdk"/>

## Digital Commerce SDK

The objective of this section is to provide information about reference templates, base libraries, models, and components that can be inherited and reused. This section also provides information about services that are sufficient for most of the business logic. You can create orders, create quotes, and more with the **DC SDK**. See the [Docs](https://documentation.conga.com/digital-commerce/december-21/digital-commerce-sdk-167772458.html) for more information.

<div id="digital-commerce-for-rest-api-developers"/>

## Digital Commerce for REST API Developers

This section is designed to provide administrators with information on the micro-service architecture that enables commerce into any part of an application.

Refer the [Docs](https://documentation.conga.com/digital-commerce/december-21/digital-commerce-for-rest-api-developers-157582100.html) to get detailed information of DC REST API

<div id="further-help"/>

## Further help

[Bootstrap](https://getbootstrap.com/docs/4.1/getting-started/introduction/)
