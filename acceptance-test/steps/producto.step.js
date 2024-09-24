const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');
const axios = require('axios').default;
const BASE_PATH = require('./base.step');

Given('Dado una solicitud', () => {

});

When('Llamamos al servicio', async () => {
    const urlProductos = BASE_PATH + '/productos';
    await axios.get(urlProductos).then(resp => {
        this.statusCode = resp.status;
        this.responseBody = resp.data;
    });
});

Then('Retorna la lista de productos', () => {
    assert.equal(200, this.statusCode);
    assert.notEqual(0, this.responseBody.length);
});

Given('Dado un sku {string}', (sku) => {
    this.sku = sku;
});

When('Obtenemos el producto', async () => {
    const urlProductos = BASE_PATH + '/productos/';
    await axios.get(urlProductos + this.sku).then(resp => {
        this.statusCode = resp.status;
        this.responseBody = resp.data;
    }).catch(error => {
        this.statusCode = error.response.status;
        this.responseBody = error.response.data;
    });
});

Then('Validamos la respuesta con codigo http {int} con codigo error {string} con mensaje error {string}', (httpCode, codigoError, mensajeError) => {
    assert.equal(httpCode, this.statusCode);
    if (this.statusCode == 409) {
        assert.equal(codigoError, this.responseBody.codigo);
        assert.equal(mensajeError, this.responseBody.mensaje);
    }
});

Given('Dado un orden {string}', (orden) => {
    this.orden = orden;
});

When('Obtenemos los productos ordenados por la propiedad', async () => {
    const urlProductos = BASE_PATH + '/productos?sort=';
    await axios.get(urlProductos + this.orden).then(resp => {
        this.statusCode = resp.status;
        this.responseBody = resp.data;
    }).catch(error => {
        this.statusCode = error.response.status;
        this.responseBody = error.response.data;
    });
});


Given('Dado un filtro {string} y un valor {string}', (filtro, valorFiltro) => {
    this.filtro = filtro;
    this.valorFiltro = valorFiltro;
});

When('Obtenemos los productos filtrados por la propiedad y valor', async () => {
    const urlProductos = BASE_PATH + '/productos?';
    await axios.get(urlProductos + this.filtro + '=' + this.valorFiltro).then(resp => {
        this.statusCode = resp.status;
        this.responseBody = resp.data;
    }).catch(error => {
        this.statusCode = error.response.status;
        this.responseBody = error.response.data;
    });
});