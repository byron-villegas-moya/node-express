const HttpStatus = require('../constants/http-status');
const { findAll } = require('../services/usuario.service');

const getUsuarios = (req, res, next) => {
    res.status(HttpStatus.OK).send(findAll());
}

module.exports = { getUsuarios }