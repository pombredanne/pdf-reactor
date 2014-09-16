'use strict';

var Promise = require('bluebird');
var phantom = Promise.promisifyAll(require('phantom'));


var session;

function createPhantomSession() {
  return new Promise(function (resolve) {
    if (session) {
      console.log('Phantom session exists');

      resolve(session);
    } else {
      console.log('Creating new Phantom session');

      phantom.create({}, function (_session) {
        session = _session;

        return resolve(Promise.promisifyAll(session));
      });
    }
  });
}

function renderPdf(session, url) {
  var page;

  console.log('Creating new page');

  return new Promise(function (resolve, reject) {
    try {
      session.createPage(function(_page) {
        page = _page;

        page.set('paperSize', {
          format: 'A4'
        }, function () {
          page.open(url, function (status) {
            console.log('Page opened with status %s', status);

            var file = __dirname + '/../../files/file.pdf';
            page.render(file, function() {
              page.close();
              page = null;

              resolve(file);
            });
          });
        });
      });
    } catch(err) {
      try {
        if (page !== null) {
          // try close the page in case it opened
          // but never rendered a pdf due to other issues
          page.close();
        }
      } catch(err) {
        // ignore as page may not have been initialised
      }
      return reject('Exception rendering pdf:' + err.toString());
    }
  });
}

process.on('exit', function() {
  session.exit();
});

module.exports = {
  createPdf: function(url) {
    return createPhantomSession()
    .then(function (session) {
      return renderPdf(session, url);
    });
  }
};
