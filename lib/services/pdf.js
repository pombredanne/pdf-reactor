'use strict';

var wkhtmltopdf = require('wkhtmltopdf');

module.exports = {
  createStream: function(url, options) {
    return wkhtmltopdf(url, options);
  }
};
