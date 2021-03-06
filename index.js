const express = require('express');
const app = express();
const winston = require('winston');
const cors=require('cors');

app.use(cors());
require('dotenv').config();

app.set('view engine', 'pug')

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/config')();
require('./startup/db')();
require('./startup/prod')(app);
require('./startup/jobs')();
require('./startup/initData')();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    winston.info(`Listening at ${port}`);
});

module.exports = server;