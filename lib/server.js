'use strict';

var util             = require('util');
var express          = require('express');
var expressValidator = require('express-validator');
var log              = require('./log');
var pdf              = require('./services/pdf');
var pkg              = require('../package');

module.exports.createServer = function () {
  var app = express();
  app.use(expressValidator());

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
    // Parameters validation
    req.checkQuery('url', 'valid url required')
      .notEmpty()
      .isURL({
        require_tld: true,
        require_protocol: true
      });
    req.checkQuery('header', 'valid url required')
      .optional()
      .isURL({
        require_tld: true,
        require_protocol: true
      });
    req.checkQuery('footer', 'valid url required')
      .optional()
      .isURL({
        require_tld: true,
        require_protocol: true
      });


    var errors = req.validationErrors(true);
    if (errors) {
      res.status(400).send('Validation errors: ' + util.inspect(errors));

      return;
    }

    var urlParam = req.query.url;
    var cacheOptions = {
      fromCache: req.sanitize('fromCache').toBoolean(),
      refreshCache: req.sanitize('refreshCache').toBoolean()
    };
    var landscape = req.sanitize('landscape').toBoolean();
    var pdfOptions  = {
      pageSize: 'A4',
      orientation: (landscape ? 'Landscape' : 'Portrait')
    };

    if (req.query.footer) {
      pdfOptions.footerHtml = req.sanitize('footer');
    }

    if (req.query.header) {
      pdfOptions.headerHtml = req.query.header;
    }

    var fileNameParam = req.query.name || new Date().getTime();


    pdf.createPdfBuffer(urlParam, cacheOptions, pdfOptions)
    .then(function (pdfBuffer) {
      res.set({
        'Content-Disposition': 'attachment; filename="' +
          fileNameParam + '.pdf"',
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length
      });

      res.status(200).send(pdfBuffer);
    })
    .catch(function (err) {
      log.error(err, 'PDF generation error');

      res.status(500).send('Internal server error');
    });
  });

  return app;
};
