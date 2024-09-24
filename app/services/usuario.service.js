const usuarios = require('../data/usuarios.json');

const findAll = () => {
    return usuarios;
}

const findByUsernameAndPassword = (username, password) => {
    return usuarios.find(usuario => usuario.username === username && usuario.password === password);
}

module.exports = { findAll, findByUsernameAndPassword }