const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/auth.controller');

router.post('', authenticate);

module.exports = router;