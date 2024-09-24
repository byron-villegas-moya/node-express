const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { showBanner } = require('./config');

showBanner();

const server = express();

server.use(cors()); // enable cors
server.use(bodyParser.json()) // for parsing application/json
server.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

module.exports = server;