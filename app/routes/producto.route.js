const express = require('express');
const router = express.Router();
const { getProductos, getProductoBySku } = require('../controllers/producto.controller');

router.get('', getProductos);
router.get('/:sku', getProductoBySku);

module.exports = router;