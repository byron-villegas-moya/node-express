const expect = require('chai').expect;
const { suma } = require('../../app/utils/calculadora.util');

describe('Suma de dos numeros', () => {
    it('Sumar 1 + 1', (done) => {
        expect(suma(1, 1)).to.equal(2);
        done();
    });
});