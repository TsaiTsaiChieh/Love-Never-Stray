const express = require('express');
const router = express.Router();

router.get('/', async function(req, res) {
  res.json('Hello, my ec2');
});

module.exports = router;
