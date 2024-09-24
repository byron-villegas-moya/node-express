const express = require('express');
const router = express.Router();
const { authorizationMiddleware } = require('../middlewares/authorization.middleware');
const { getUsuarios } = require('../controllers/usuario.controller');
const { authorizeMiddleware } = require('../middlewares/authorize.middleware');

router.use(authorizationMiddleware);

router.get('', authorizeMiddleware(['ROLE_USER_EXPRESS', 'ROLE_USER_NODE']), getUsuarios);

module.exports = router;