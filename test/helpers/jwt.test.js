const expect = require('chai').expect;
const usuarios = require('../../app/data/usuarios.json');
const { generateToken, verifyToken } = require('../../app/helpers/jwt.helper');

describe('Generar token para usuario', () => {
    it('Generar token usuario byron.villegas', (done) => {
        const username = 'byron.villegas';
        const user = usuarios.find(usuario => usuario.username === username);
        const { id, nombres, apellidos } = user;
        const token = generateToken({ id, nombres, apellidos });

        expect(generateToken({ id, nombres, apellidos })).to.equal(token);
        done();
    });
});

describe('Validar token generado ok', () => {
    it('Validar token', (done) => {
        const username = 'byron.villegas';
        const user = usuarios.find(usuario => usuario.username === username);
        const { id, nombres, apellidos } = user;
        const token = generateToken({ id, nombres, apellidos });

        expect(verifyToken(token)).to.equal(true);
        done();
    });
});

describe('Validar token generado con error', () => {
    it('Validar token', (done) => {
        const token = 'a';

        expect(verifyToken(token)).to.equal(false);
        done();
    });
});

describe('Validar token expirado', () => {
    it('Validar token', (done) => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibm9tYnJlcyI6IkJ5cm9uIFN0ZXZlbnMiLCJhcGVsbGlkb3MiOiJWaWxsZWdhcyBNb3lhIiwiaWF0IjoxNjU3NTk0ODk5LCJleHAiOjE2NTc1OTQ5MDB9.ZpaVLm6v8eB4qqbCrsQwkqiYLB2-VmfbrtejJZhVChA';

        expect(verifyToken(token)).to.equal(false);
        done();
    });
});