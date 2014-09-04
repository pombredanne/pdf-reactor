Express html to pdf expemple
============================

This a simple exemple how to create an express server that transform an html page to a pdf

## Install

First install **wkhtmltohtml** for your system from here :  [http://wkhtmltopdf.org/downloads.html](http://wkhtmltopdf.org/downloads.html)

Then simply clone the repository:   
`git clone https://github.com/Woorank/express-pdf-generation.git`

## Configure

You can configure the server listen port (default: 80) on the config/[your environement].json file.


## Routes


**GET** /pdf?url=`http://www.google.com&name=my_file`

Tries to guess the facebook brand page and returns all its details


Parameters     | Description
--------------:| ---------------------------
url            | The url of the page you want to convert in pdf
name           | (optional) the name of the pdf file (in this case my_file.pdf)