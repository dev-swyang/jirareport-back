const mongoose = require('mongoose')
const { Schema } = mongoose

const timedateSchema = new Schema({
    date: {
        type: String,
        require: true,
        unique: false
    },
    id: {
        type: String,
        require: true,
        unique: false
    },
    category: {
        type: Object,
        require: true,
        unique: false
    },
    time: {
        type: Number,
        require: false,
        unique: false
    },
    time_total: {
        type: Number,
        require: false,
        unique: false
    },
})

module.exports = mongoose.model('Timedate', timedateSchema)