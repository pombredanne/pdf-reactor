'use strict';

var config = require('config');
var log    = require('./lib/log');
var server = require('./lib/server');


process.on('uncaughtException', function (error) {
  log.fatal({
    stack: error.stack
  }, 'Uncaught exception, exiting...');
  process.exit(1);
});

// Start the server
server.createServer().listen(config.port, function () {
  log.info('Server started on port ' + config.port);
});
