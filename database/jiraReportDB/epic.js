const mongoose = require('mongoose')
const { Schema } = mongoose

const epicSchema = new Schema({
    key: {
        type: String,
        require: true,
        unique: false
    },
    name: {
        type: String,
        require: false,
        unique: false
    },
    product: {
        type: String,
        require: false,
        unique: false
    },
    project: {
        type: String,
        require: false,
        unique: false
    },
    modules: {
        type: Object,
        require: false,
        unique: false
    },
    status: {
        type: String,
        require: false,
        unique: false
    },
    types: {
        type: Object,
        require: false,
        unique: false
    },
    trade: {
        type: String,
        require: false,
        unique: false
    },
    summary: {
        type: String,
        require: false,
        unique: false
    },
    dev_type: {
        type: String,
        require: false,
        unique: false
    },
    id_assign: {
        type: String,
        require: false,
        unique: false
    },
    date: {
        type: Object,
        require: false,
        unique: false
    },
})

module.exports = mongoose.model('Epic', epicSchema)