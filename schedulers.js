require('dotenv').config();
const express = require('express');
const Haven = require('domain-haven');
const scheduler = require('node-schedule');
const { schedulerPort } = process.env;
// const COA = require('./src/schedulers/COA');
const meetPets = require('./src/schedulers/meetPets');

const app = express();
app.use(Haven.haven());

scheduler.scheduleJob('*/60 * * * * *', async function() {
  // await COA();
  await meetPets();
});

app.listen(schedulerPort, function() {
  console.log(`Scheduler on port: ${schedulerPort}`);
});

module.exports = app;
