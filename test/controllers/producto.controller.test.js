const request = require('supertest');
const { config } = require('../../app/configs/config');
const ErrorMessage = require('../../app/constants/error-message');
const HttpStatus = require('../../app/constants/http-status');
const app = require('../../app/app');
const productos = require('../../app/data/productos.json');

describe('Obtener productos', () => {
    it('Retorna una lista de productos', () => {
        return request(app)
            .get(config.server.context + '/productos')
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .expect(productos);
    });
});

describe('Obtener producto mediante sku ok', () => {
    it('Retorna el producto', () => {
        const producto = productos[0];
        const sku = producto.sku;
        return request(app)
            .get(config.server.context + '/productos/' + sku)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .expect(producto);
    });
});

describe('Obtener producto mediante sku con tipo valor erroneo', () => {
    it('Retorna error negocio exception', () => {
        const sku = 'a';
        return request(app)
            .get(config.server.context + '/productos/' + sku)
            .expect(HttpStatus.CONFLICT)
            .expect('Content-Type', /json/)
            .expect({ codigo: ErrorMessage.CODIGO_SKU_DEBE_SER_NUMERO_ENTERO, mensaje: ErrorMessage.MENSAJE_SKU_DEBE_SER_NUMERO_ENTERO });
    });
});

describe('Obtener producto mediante sku inexistente', () => {
    it('Retorna error negocio exception', () => {
        const sku = '1';
        return request(app)
            .get(config.server.context + '/productos/' + sku)
            .expect(HttpStatus.CONFLICT)
            .expect('Content-Type', /json/)
            .expect({ codigo: ErrorMessage.CODIGO_PRODUCTO_NO_ENCONTRADO, mensaje: ErrorMessage.MENSAJE_PRODUCTO_NO_ENCONTRADO });
    });
});

describe('Obtener productos ordenados por precio descendiente', () => {
    it('Retorna la lista de productos ordenados por precio descendiente', () => {
        const sort = 'sort=';
        const sortProperty = '+precio';
        return request(app)
            .get(config.server.context + '/productos?' + sort + sortProperty)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .expect(productos.sort((x, y) => x.precio - y.precio));
    });
});

describe('Obtener productos ordenados por maca ascendente', () => {
    it('Retorna la lista de productos ordenados por marca ascendente', () => {
        const sort = 'sort=';
        const sortProperty = '-marca';
        return request(app)
            .get(config.server.context + '/productos?' + sort + sortProperty)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .expect(productos.sort((x, y) => x.marca - y.marca));
    });
});


describe('Obtene productos ordenados por una propiedad inexistente', () => {
    const sort = 'sort=';
    const sortProperty = 'a';
    it('Retorna error tecnico exception', () => {
        return request(app)
            .get(config.server.context + '/productos?' + sort + sortProperty)
            .expect(HttpStatus.INTERNAL_SERVER_ERROR)
            .expect('Content-Type', /json/)
            .expect({ codigo: ErrorMessage.CODIGO_ERROR__DEL_SERVIDOR, mensaje: ErrorMessage.MENSAJE_ERROR_DEL_SERVIDOR });
    });
});

describe('Obtener productos filtrados por precio', () => {
    it('Retorna la lista de productos filtrada por precio', () => {
        const producto = productos[0];
        const filterProperty = 'precio=';
        const propertyValue = producto.precio;
        return request(app)
            .get(config.server.context + '/productos?' + filterProperty + propertyValue)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .expect(productos.filter(pro => pro.precio === producto.precio));
    });
});

describe('Obtener productos filtrados por marca', () => {
    it('Retorna la lista de productos filtrada por marca', () => {
        const producto = productos[0];
        const filterProperty = 'marca=';
        const propertyValue = producto.marca;
        return request(app)
            .get(config.server.context + '/productos?' + filterProperty + propertyValue)
            .expect(HttpStatus.OK)
            .expect('Content-Type', /json/)
            .expect(productos.filter(pro => pro.marca === producto.marca));
    });
});

describe('Obtener productos filtrados por propiedad inexistente', () => {
    it('Retorna error negocio exception', () => {
        const filterProperty = 'a=';
        const propertyValue = '';
        return request(app)
            .get(config.server.context + '/productos?' + filterProperty + propertyValue)
            .expect(HttpStatus.CONFLICT)
            .expect('Content-Type', /json/)
            .expect({ codigo: ErrorMessage.CODIGO_PROPIEDAD_NO_ENCONTRADA, mensaje: ErrorMessage.MENSAJE_PROPIEDAD_NO_ENCONTRADA });
    });
});

describe('Obtener productos filtrados por propiedad y formato de valor no permitido', () => {
    it('Retorna error tecnico exception', () => {
        const filterProperty = 'precio=';
        const propertyValue = 'a';
        return request(app)
            .get(config.server.context + '/productos?' + filterProperty + propertyValue)
            .expect(HttpStatus.INTERNAL_SERVER_ERROR)
            .expect('Content-Type', /json/)
            .expect({ codigo: ErrorMessage.CODIGO_FORMATO_DE_VALOR_NO_PERMITIDO_PARA_LA_PROPIEDAD, mensaje: ErrorMessage.MENSAJE_FORMATO_DE_VALOR_NO_PERMITIDO_PARA_LA_PROPIEDAD });
    });
});