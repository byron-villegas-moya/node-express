const HttpStatus = require('../constants/http-status');
const { findByUsernameAndPassword } = require('../services/usuario.service');
const { generateToken } = require('../helpers/jwt.helper');
const Authorization = require('../constants/authorization');

const authenticate = (req, res, next) => {
    const loginRequestDTO = req.body;

    if (!loginRequestDTO.username || !loginRequestDTO.password) {
        return res.status(HttpStatus.BAD_REQUEST).send();
    }

    const user = findByUsernameAndPassword(loginRequestDTO.username, loginRequestDTO.password);

    if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).send();
    }

    const { id, nombres, apellidos } = user;

    const payload = { id, nombres, apellidos, authorities: Authorization.ROLES, scope: Authorization.SCOPE };

    const token = generateToken(payload);

    const accessResponseDTO = { id, nombres, apellidos, accessToken: token };

    return res.status(HttpStatus.OK).send(accessResponseDTO);
}

module.exports = { authenticate }