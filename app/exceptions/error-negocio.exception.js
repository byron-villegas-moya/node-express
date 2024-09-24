class ErrorNegocioException {
    constructor(codigo, mensaje) {
        Error.call(this);
        Error.captureStackTrace(this);
        this.codigo = codigo;
        this.mensaje = mensaje;
    }
};

ErrorNegocioException.prototype = Object.create(Error.prototype);
ErrorNegocioException.prototype.constructor = ErrorNegocioException;

module.exports = ErrorNegocioException;