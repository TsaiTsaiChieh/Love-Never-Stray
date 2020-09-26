require('dotenv').config();
const Have = require('domain-haven');
const express = require('express');
const { appPort } = process.env;

const app = express();
app.use(Have.haven());

app.use('/', require('./src/routes/index'));
app.listen(appPort, function() {
  console.log(`Love-Never-Stray on port: ${appPort}`);
});
