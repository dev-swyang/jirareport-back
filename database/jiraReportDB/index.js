const mongoose = require('mongoose')
const utils = require('../../utils')

const connect = () => {
    const {
        REPORT_SERVER,
        REPORT_PORT,
        REPORT_USERNAME,
        REPORT_PASSWORD,
        REPORT_DATABASE
    } = process.env

    mongoose.connect(`mongodb://${REPORT_USERNAME}:${REPORT_PASSWORD}@${REPORT_SERVER}:${REPORT_PORT}/admin`, {
        dbName: REPORT_DATABASE,
        userNewUrlParser: true,
        userCreateIndex: true
    }, (err) => {
        if (err) {
            utils.err(err)
        } else {
            utils.log('##### connected #####')
        }
    })
}

mongoose.connection.on('error', (err) => {
    utils.err(`connect err / ${err}`)
})

mongoose.connection.on('disconnected', () => {
    utils.log('ReConnecting...')
    connect()
})

module.exports = connect;