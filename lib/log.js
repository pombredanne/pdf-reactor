'use strict';

var config = require('config'),
    bunyan = require('bunyan');

module.exports = bunyan.createLogger({
  name: 'node-boilerplate',
  level: config.loglevel
});
