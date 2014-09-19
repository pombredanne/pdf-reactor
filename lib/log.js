'use strict';

var config = require('config'),
  bunyan = require('bunyan');

module.exports = bunyan.createLogger({
  name: 'pdf-reactor',
  level: config.loglevel
});
