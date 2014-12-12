FROM node:0.10.32

ENV APP_NAME pdf-reactor
ENV WKHTMLTOPDF 0.12.1

#install wkhtmltopdf
RUN \
    apt-get install -y fontconfig libjpeg8 && \
    mkdir /opt/wkhtmltopdf && \
    cd /opt/wkhtmltopdf && \
    curl -O -L http://downloads.sourceforge.net/project/wkhtmltopdf/${WKHTMLTOPDF}/wkhtmltox-{$WKHTMLTOPDF}_linux-precise-amd64.deb  && \
    dpkg -i wkhtmltox-${WKHTMLTOPDF}_linux-precise-amd64.deb

ADD . /var/www
WORKDIR /var/www

RUN npm install --production

CMD ["npm", "start"]
