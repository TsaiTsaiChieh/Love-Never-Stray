const express = require('express');
const router = express.Router();

router.get('/search', require('../controllers/adoption/search'));

module.exports = router;
