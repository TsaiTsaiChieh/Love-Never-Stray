const express = require('express');
const router = express.Router();
const { INTERNAL_SERVER_ERROR } = require('http-status');
const { mysql } = require('../configs/mysqlSetting');

router.get('/', async function(req, res) {
  try {
    const { db, mysqlUsername, mysqlPassword, host, mysqlPort } = process.env;
    console.log(db, mysqlUsername, mysqlPassword, host, mysqlPort);
    await mysql.authenticate();
    res.send('Connection has been established successfully.');
  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR).json({
      message: 'Unable to connect to the database',
      error: err
    });
  }
});

module.exports = router;
