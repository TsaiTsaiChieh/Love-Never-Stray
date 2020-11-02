require('dotenv').config();
const express = require('express');
const Haven = require('domain-haven');
const scheduler = require('node-schedule-tz');
const { schedulerPort, ZONE_TW } = process.env;
const meetPets = require('./src/schedulers/meetPets');
const COA = require('./src/schedulers/COA');

const app = express();
app.use(Haven.haven());

scheduler.scheduleJob('更新 from 台灣認養地圖', '* * 6 * * *', ZONE_TW, async function() {
  await meetPets();
});

scheduler.scheduleJob('更新 from 政府收容所', '* * 7 * * *', ZONE_TW, async function() {
  await COA();
});

app.listen(schedulerPort, function() {
  console.log(`Scheduler on port: ${schedulerPort}`);
});

module.exports = app;
