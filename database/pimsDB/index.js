const Connection = require('tedious').Connection
const query = require('./resource/index')

const config = {
    option: {
        server: process.env.PIMS_SERVER,
        authentication: {
            options: {
                userName: process.env.PIMS_USERNAME,
                password: process.env.PIMS_PASSWORK
            },
            type: 'default'
        },
        options: {
            encrypt: false,
            database: process.env.PIMS_DATABASE,
            port: parseInt(process.env.PIMS_PORT)
        }
    },
    query: query
}

module.exports = config