const { parameters } = require('../../cucumber').default;

const HOST = parameters['HOST'];
const PORT = parameters['PORT'];
const CONTEXT_PATH = parameters['CONTEXT_PATH'];
const BASE_PATH = HOST + ':' + PORT + CONTEXT_PATH;

module.exports = BASE_PATH;