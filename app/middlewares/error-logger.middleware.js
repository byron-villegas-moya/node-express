const logger = require('pino')();
const ErrorNegocioException = require("../exceptions/error-negocio.exception");
const ErrorTecnicoException = require("../exceptions/error-tecnico.exception");

const errorLoggerMiddleware = (error, req, res, next) => {
    if (error instanceof ErrorNegocioException || error instanceof ErrorTecnicoException) {
        logger.error({ type: error.constructor.name, msg: error });
    }
    else {
        logger.error({ type: error.constructor.name, msg: error.message });
    }

    next(error);
}

module.exports = { errorLoggerMiddleware }