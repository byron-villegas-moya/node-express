const HttpStatus = require('../constants/http-status');
const { findAll, findBySku, findByPropertyAndValue, sortByProperty } = require('../services/producto.service');

const getProductos = (req, res, next) => {
    const queryKeys = Object.keys(req.query);
    switch (queryKeys[0]) {
        case 'sort':
            sortByProperty(req.query.sort).then(resp => res.status(HttpStatus.OK).send(resp)).catch(error => next(error));
            break;
        default:
            const property = queryKeys[0];
            const value = req.query[property];

            if (property) {
                findByPropertyAndValue(property, value).then(resp => res.status(HttpStatus.OK).send(resp)).catch(error => next(error));
                break;
            }

            res.status(HttpStatus.OK).send(findAll());
            break;
    }
}

const getProductoBySku = (req, res, next) => {
    findBySku(req.params.sku).then(resp => res.status(HttpStatus.OK).send(resp)).catch(error => next(error));
}

module.exports = { getProductos, getProductoBySku }