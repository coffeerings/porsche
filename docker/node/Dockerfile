FROM node:16
WORKDIR /usr/app
COPY ./scraper/package.json .
RUN npm install --quiet
COPY ./scraper/ .