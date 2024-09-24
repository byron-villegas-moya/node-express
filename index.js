const { config } = require('./app/configs/config');
const app = require('./app/app');

const PORT = config.server.port;
const CONTEXT = config.server.context;

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}${CONTEXT}`);
});