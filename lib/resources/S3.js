'use strict';

var config = require('config');
var AWS = require('aws-sdk');

if (config.aws) {
  AWS.config.update(config.aws);
}

module.exports = new AWS.S3();
