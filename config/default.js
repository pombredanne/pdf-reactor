'use strict';

var env = process.env;

module.exports = {
  loglevel: env.LOGLEVEL || 'info',
  port: env.APP_PORT || env.PORT || 80,
  aws: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION
  },
  s3: {
    bucket: env.S3_BUCKET
  }
};
