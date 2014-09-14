'use strict';

var config      = require('config');
var Promise     = require('bluebird');
var wkhtmltopdf = require('wkhtmltopdf');
var crypto      = require('crypto');
var s3          = Promise.promisifyAll(require('../resources/S3'));

function createCacheFileName(url, options) {
  var baseText = url + JSON.stringify(options);

  return crypto
    .createHash('sha256')
    .update(baseText, 'utf8')
    .digest('base64') + '.pdf';
}

module.exports = {
  createStreamPromise: function(url, options) {
    var cacheFileName = createCacheFileName(url, options);

    return s3.headObjectAsync({
      Bucket: config.s3.bucket,
      Key: cacheFileName
    })
    .then(function () {
      return s3.getObjectAsync({
        Bucket: config.s3.bucket,
        Key: cacheFileName
      })
      .createReadStream();
    })
    .catch(function (err) {
      var pdfStream = wkhtmltopdf(url, options);

      // Will write at the same that send pdf
      s3.putObjectAsync({
        Bucket: config.s3.bucket,
        Key: cacheFileName,
        Body: pdfStream
      })
      .catch(function (err) {
        console.log('PUT ERROR', err);
      });

      return pdfStream;
    });
  }
};
