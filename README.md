PDF Reactor
===========

This an express server that will generate PDF from a provided url based on wkhtmltopdf.
It also use S3 to cache on request the pdf that won't change (like: invoices, ...)

## Install

First install **wkhtmltohtml** for your system from here :  [http://wkhtmltopdf.org/downloads.html](http://wkhtmltopdf.org/downloads.html)

**Note:** The Mac OSX version is buggy and will some time create image based pdfs instead of text based. Better to install it on a Linux.

Then simply clone the repository:   

`git clone https://github.com/Woorank/pdf-reactor.git`

## Configuration

You can configure the server on the config/[your environement].json file.
Here is a sample :

```json
{
  "loglevel": "info",
  "port": 3000,
  "aws": {
    "accessKeyId": "<YOUR_ACCESS_KEY>",
    "secretAccessKey": "<YOUR_SECRET_ACCESS_KEY>",
    "region": "us-east-1"
  },
  "s3": {
    "bucket": "<YOUR_DEDICATED_S3_BUCKET_NAME>"
  }
}
```

## Routes


**GET** /pdf?url=`http://www.google.com`

Tries to guess the facebook brand page and returns all its details


Parameters     | Description
--------------:| ---------------------------
url            | <string> The url of the page you want to convert in pdf
header         | (optional) <string> The url that provides the html for the header
footer         | (optional) <string> The url that provides the html for the footer
landscape      | (optional) <boolean> Change the orientation from portrait to landscape
fromCache      | (optional) <boolean> Will try first to get the pdf from S3, if it doesn't exists it'll add it on S3 while sending it.
refreshCache   | (optional) <boolean> Will refresh or create the pdf on S3 while sending it.
