FROM node:0.10.32

ENV APP_NAME pdf-reactor

ADD . /var/www
WORKDIR /var/www

RUN npm install --production

CMD ["npm", "start"]
