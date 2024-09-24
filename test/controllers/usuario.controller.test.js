const request = require('supertest');
const { config } = require('../../app/configs/config');
const HttpStatus = require('../../app/constants/http-status');
const app = require('../../app/app');
const usuarios = require('../../app/data/usuarios.json');
const { generateToken } = require('../../app/helpers/jwt.helper');
const Authorization = require('../../app/constants/authorization');

describe('Obtener usuarios', () => {
    let token = '';

    before('Obtenemos el token', (done) => {
        const usuario = usuarios[0];
        const { id, nombres, apellidos } = usuario;
        const payload = { id, nombres, apellidos, authorities: Authorization.ROLES, scope: Authorization.SCOPE };
        token = generateToken(payload);
        done();
    });

    it('Retorna una lista de usuarios', () => {
        return request(app)
            .get(config.server.context + '/usuarios')
            .set('Authorization', 'Bearer ' + token)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .expect(usuarios);
    });
});

describe('Obtener usuarios sin token', () => {
    it('Retorna unauthorized', () => {
        return request(app)
            .get(config.server.context + '/usuarios')
            .expect(HttpStatus.UNAUTHORIZED);
    });
});


describe('Obtener usuarios sin palabra Bearer', () => {
    it('Retorna unauthorized', () => {
        return request(app)
            .get(config.server.context + '/usuarios')
            .set('Authorization', 'A')
            .expect(HttpStatus.UNAUTHORIZED);
    });
});

describe('Obtener usuarios con token invalido', () => {
    it('Retorna unauthorized', () => {
        const token = 'a';
        return request(app)
            .get(config.server.context + '/usuarios')
            .set('Authorization', 'Bearer ' + token)
            .expect(HttpStatus.UNAUTHORIZED);
    });
});

describe('Obtener usuarios con token con rol invalido', () => {
    let token = '';

    before('Obtenemos el token', (done) => {
        const usuario = usuarios[0];
        const { id, nombres, apellidos } = usuario;
        const payload = { id, nombres, apellidos, authorities: ['a'], scope: Authorization.SCOPE };
        token = generateToken(payload);
        done();
    });

    it('Retorna unauthorized', () => {
        return request(app)
            .get(config.server.context + '/usuarios')
            .set('Authorization', 'Bearer ' + token)
            .expect(HttpStatus.UNAUTHORIZED);
    });
});