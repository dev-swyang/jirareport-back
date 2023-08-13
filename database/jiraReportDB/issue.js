const mongoose = require('mongoose')
const { Schema } = mongoose

const issueSchema = new Schema({
    key: {
        type: String,
        require: true,
        unique: true
    },
    group: {
        type: String,
        require: false,
        unique: false
    },
    project: {
        type: String,
        require: false,
        unique: false
    },
    product: {
        type: String,
        require: false,
        unique: false
    },
    trade: {
        type: String,
        require: false,
        unique: false
    },
    dev_type: {
        type: String,
        require: false,
        unique: false
    },
    type: {
        type: String,
        require: false,
        unique: false
    },
    status: {
        type: String,
        require: false,
        unique: false
    },
    summary: {
        type: String,
        require: false,
        unique: false
    },
    modules: {
        type: Object,
        require: false,
        unique: false
    },
    types: {
        type: Object,
        require: false,
        unique: false
    },
    epic: {
        type: Object,
        require: false,
        unique: false
    },
    id: {
        type: Object,
        require: false,
        unique: false
    },
    date: {
        type: Object,
        require: false,
        unique: false
    },
    update_date: {
        type: String,
        default: Date.Now,
        require: false,
        unique: false
    },
    update_ip: {
        type: String,
        default: 'localhost',
        require: false,
        unique: false
    },
})

module.exports = mongoose.model('Issue', issueSchema)