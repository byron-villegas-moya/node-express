const jwt = require('jsonwebtoken');
const { config } = require('../configs/config');

const generateToken = (payload) => {
    return jwt.sign(payload, config.jwt.secretKey, { expiresIn: config.jwt.expiresIn });
}

const verifyToken = (token) => {
    try {
        jwt.verify(token, config.jwt.secretKey);
        return true;
    }
    catch (error) {
        return false;
    }
}

const getTokenRoles = (token) => {
    const payload = jwt.verify(token, config.jwt.secretKey);
    return payload.authorities;
}

module.exports = { generateToken, verifyToken, getTokenRoles }