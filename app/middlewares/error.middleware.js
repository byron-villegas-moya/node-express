const ErrorMessage = require("../constants/error-message");
const HttpStatus = require("../constants/http-status");
const ErrorNegocioException = require("../exceptions/error-negocio.exception");
const ErrorTecnicoException = require("../exceptions/error-tecnico.exception");

const errorMiddleware = (error, req, res, next) => {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody = { codigo: ErrorMessage.CODIGO_ERROR__DEL_SERVIDOR, mensaje: ErrorMessage.MENSAJE_ERROR_DEL_SERVIDOR }
    switch (error.constructor) {
        case ErrorNegocioException:
            status = HttpStatus.CONFLICT;
        case ErrorTecnicoException:
            responseBody = error;
            break;
    }
    return res.status(status).send(responseBody);
}

module.exports = { errorMiddleware }