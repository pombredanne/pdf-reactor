'use strict';

var express = require('express');
var pkg     = require('../package');
var pdf     = require('./services/pdf');

module.exports.createServer = function () {
  var app = express();

  app.get('/', function (req, res) {
    res.json({
      welcome: pkg.name,
      version: pkg.version
    });
  });

  app.get('/healthcheck', function (req, res) {
    // Say OK
    res.status(200)
    .send('OK')
    .end();
  });

  app.get('/pdf', function (req, res) {
    if (!req.query.url) {
      res.status(400).send('Missing url parameter');

      return;
    }

    pdf.createPdf(req.query.url)
    .then(function (file) {
      res.download(file, file.pdf);
    });
  });

  return app;
};
