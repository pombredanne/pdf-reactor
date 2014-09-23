'use strict';

var config      = require('config');
var Promise     = require('bluebird');
var wkhtmltopdf = require('wkhtmltopdf');
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


function createPdfPromise(pdfStream, cacheFileName, cache) {
  return new Promise(function (resolve, reject) {
    var pdfParts = [];
    var pdfLength = 0;

    pdfStream
    .on('data', function (chunk) {
      pdfParts.push(chunk);
      pdfLength += chunk.length;
    })
    .on('error', function (err) {
      reject(err);
    })
    .on('end', function () {
      var pdfBuffer = new Buffer(pdfLength);
      var pdfPos = 0;

      for (var i = 0; i < pdfParts.length; i++) {
        pdfParts[i].copy(pdfBuffer, pdfPos, 0, pdfParts[i].length);
        pdfPos += pdfParts[i].length;
      }

      if (cache) {
        // Will write at the same that send pdf
        // This operation don't have to be block
        // and shouldn't crash the app if it errors
        s3.putObjectAsync({
          Bucket: config.s3.bucket,
          Key: cacheFileName,
          Body: pdfBuffer,
          ContentLength: pdfBuffer.length
        })
        .then(function () {
          log.info('%s successfully stored on S3.', cacheFileName);
        })
        .catch(function (err) {
          log.warn(err);
        });
      }

      resolve(pdfBuffer);
    });
  });
}

module.exports = {
  createPdfBuffer: function (url, cacheOptions, pdfOptions) {
    var cacheFileName = createCacheFileName(url, pdfOptions);
    var promise;

    if (cacheOptions.fromCache) {
      log.info('Trying to get %s from cache', cacheFileName);

      promise = s3.headObjectAsync({
        Bucket: config.s3.bucket,
        Key: cacheFileName
      })
      .then(function () {
        // If we reach this point we know file exists on S3
        return s3.getObjectAsync({
          Bucket: config.s3.bucket,
          Key: cacheFileName
        });
      })
      .catch(function (err) {
        // Only not found is expected, but we don't want to crash
        if (err.cause.code !== 'NotFound') {
          log.warn(err);
        }
        log.info('%s not in cache, start generating', cacheFileName);

        return createPdfPromise(
          wkhtmltopdf(url, pdfOptions),
          cacheFileName,
          true
        );
      });
    } else {
      log.info('Generating %s', cacheFileName);

      promise = createPdfPromise(
        wkhtmltopdf(url, pdfOptions),
        cacheFileName,
        cacheOptions.refreshCache
      );
    }

    return promise;
  }
};
