const express = require('express');
const Pet = require('../schemas/pets');
const router = express.Router();

router.get('/', async function(req, res) {
  await Pet.sync({ force: true });
  res.json('Hello, my test');
});

module.exports = router;
