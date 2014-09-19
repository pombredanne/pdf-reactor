'use strict';

var config      = require('config');
var Promise     = require('bluebird');
var wkhtmltopdf = require('wkhtmltopdf');
var stream      = require('stream');
var crypto      = require('crypto');
var log         = require('../log').child({ service: 'pdf' });
var s3          = Promise.promisifyAll(require('../resources/S3'));

function createCacheFileName(url, options) {
  var baseText = url + JSON.stringify(options);

  return crypto
    .createHash('sha256')
    .update(baseText, 'utf8')
    .digest('base64') + '.pdf';
}

function createCachingStream(cacheFileName) {
  var cachingStream = new stream.Transform();

  var pdfParts = [];
  var pdfLength = 0;

  cachingStream._transform = function (chunk, encoding, done) {
    pdfParts.push(chunk);
    pdfLength += chunk.length;

    this.push(chunk);

    done();
  };

  cachingStream._flush = function (done) {
    var pdf = new Buffer(pdfLength);
    var pdfPos = 0;

    log.info('Trying to store %s on S3.', cacheFileName);

    for (var i = 0; i < pdfParts.length; i++) {
      pdfParts[i].copy(pdf, pdfPos, 0, pdfParts[i].length);
      pdfPos += pdfParts[i].length;
    }

    // Will write at the same that send pdf
    // This operation don't have to be block
    // and shouldn't crash the app if it errors
    s3.putObjectAsync({
      Bucket: config.s3.bucket,
      Key: cacheFileName,
      Body: pdf,
      ContentLength: pdf.length
    })
    .then(function () {
      log.info('%s successfully stored on S3.', cacheFileName);
    })
    .catch(function (err) {
      log.warn(err);
    });

    done();
  };

  return cachingStream;
}

module.exports = {
  createStreamPromise: function (url, cacheOptions, pdfOptions) {
    var cacheFileName = createCacheFileName(url, pdfOptions);

    if (cacheOptions.fromCache) {
      log.info('Trying to get %s from cache', cacheFileName);
      return s3.headObjectAsync({
        Bucket: config.s3.bucket,
        Key: cacheFileName
      })
      .then(function () {
        // If we reach this point we know file exists on S3
        return s3.getObject({
          Bucket: config.s3.bucket,
          Key: cacheFileName
        })
        .createReadStream();
      })
      .catch(function (err) {
        // Only not found is expected
        if (err.cause.code !== 'NotFound') {
          log.warn(err);
        }
        log.info('%s not in cache, start generating', cacheFileName);

        return wkhtmltopdf(url, pdfOptions)
        .pipe(createCachingStream(cacheFileName));
      });
    } else {
      var pdfStream = wkhtmltopdf(url, pdfOptions);

      log.info('Generating %s', cacheFileName);

      if (!cacheOptions.refreshCache) {
        return Promise.resolve(pdfStream);
      }

      return Promise.resolve(
        pdfStream.pipe(createCachingStream(cacheFileName))
      );
    }
  }
};
