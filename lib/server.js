'use strict';

var util             = require('util');
var express          = require('express');
var expressValidator = require('express-validator');
var pkg              = require('../package');
var pdf              = require('./services/pdf');

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
      pdfOptions.footerHtml = req.sanitize('footer').toBoolean();
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
