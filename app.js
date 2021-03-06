require('dotenv').config();
const express = require('express');
const Haven = require('domain-haven');
const { appPort } = process.env;

const app = express();
app.use(Haven.haven());

app.use('/api', require('./src/routes/index'));
app.use('/connection_mysql', require('./src/routes/connection'));
app.listen(appPort, function() {
  console.log(`Love-Never-Stray on port: ${appPort}`);
});
