module.exports = {
    default: {
        publishQuiet: true,
        parallel: 0,
        format: ['html:cucumber-report.html'],
        paths: ['acceptance-test/features/' + (process.env.npm_config_ambiente || 'dev')],
        require: ['acceptance-test/steps'],
        parameters: {
            HOST: process.env.npm_config_host || 'http://localhost',
            PORT: process.env.npm_config_port || 3000,
            CONTEXT_PATH: process.env.npm_config_context_path || '/api',
            AMBIENTE: process.env.npm_config_ambiente || 'dev'
        }
    }
}