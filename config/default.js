'use strict';

var env = process.env;

module.exports = {
  loglevel: env.LOGLEVEL || 'info',
  port: env.port || 80
};
