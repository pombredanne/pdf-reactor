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

    var urlParam = req.query.url;
    var cacheOptions = {
      fromCache: req.query.fromCache,
      refreshCache: req.query.refreshCache,
    };
    var pdfOptions  = {
      pageSize: 'A4',
      orientation: (req.query.landscape ? 'Landscape' : 'Portrait')
    };

    if (req.query.footer) {
      pdfOptions.footerHtml = req.query.footer;
    }

    if (req.query.header) {
      pdfOptions.headerHtml = req.query.header;
    }

    var fileNameParam = req.query.name || new Date().getTime();

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' + fileNameParam + '.pdf"'
    );

    pdf.createStreamPromise(urlParam, cacheOptions, pdfOptions)
    .then(function (pdfStream) {
      pdfStream.pipe(res);
    });
  });

  return app;
};
