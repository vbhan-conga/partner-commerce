"use strict";

var replace = require("replace");
var path = require("path");
var basePath = process.env.npm_config_basePath;

console.log('update base path ==== ', basePath);

if (basePath) {
  replace({
    regex: /(<base href=")(.*?)(">)/,
    replacement: '<base href="' + basePath + '">',
    paths: [path.resolve(__dirname, 'index.html')],
    recursive: false,
    silent: true
  });

  /*replace({
    regex: /\/index.html/,
    replacement: basePath + "index.html",
    paths: [path.resolve(__dirname, 'ngsw.json')],
    recursive: false,
    silent: true
  });*/
}
