const productos = require('../../app/data/productos.json');

obtenerSkuProducto = (requestParams, ctx, ee, next) => {
    const producto = productos[0];
    ctx.vars['sku'] = producto.sku;
    return next();
}

module.exports = {
    obtenerSkuProducto,
};