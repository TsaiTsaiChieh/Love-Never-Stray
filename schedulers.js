require('dotenv').config();
const express = require('express');
const Haven = require('domain-haven');
const scheduler = require('node-schedule');
const { schedulerPort } = process.env;
const COA = require('./src/schedulers/COA');

const app = express();
app.use(Haven.haven());

scheduler.scheduleJob('*/5 * * * * *', async function() {
  await COA();
});

app.listen(schedulerPort, function() {
  console.log(`Scheduler on port: ${schedulerPort}`);
});

module.exports = app;
