const express = require('express');
const router = express.Router();

router.get('/', async function(req, res) {
  res.json('Hello, my test33');
});

module.exports = router;
