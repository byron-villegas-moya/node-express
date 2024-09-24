const HttpStatus = require('../constants/http-status');
const Number = require("../constants/number");
const Symbol = require("../constants/symbol");
const { getTokenRoles } = require("../helpers/jwt.helper");

const authorizeMiddleware = (roles) => {
    return [
        (req, res, next) => {
            const headers = req.headers;
            const token = headers.authorization.substring(headers.authorization.indexOf(Symbol.SPACE) + Number.ONE, headers.authorization.length).trim();
            const rolesToken = getTokenRoles(token);

            const isRolValid = roles.some(rol => rolesToken.indexOf(rol) >= Number.ZERO);

            if (!isRolValid) {
                return res.status(HttpStatus.UNAUTHORIZED).send();
            }

            next();
        }
    ];
}

module.exports = { authorizeMiddleware };