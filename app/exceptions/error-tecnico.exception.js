class ErrorTecnicoException {
    constructor(codigo, mensaje) {
        Error.call(this);
        Error.captureStackTrace(this);
        this.codigo = codigo;
        this.mensaje = mensaje;
    }
};

ErrorTecnicoException.prototype = Object.create(Error.prototype);
ErrorTecnicoException.prototype.constructor = ErrorTecnicoException;

module.exports = ErrorTecnicoException;