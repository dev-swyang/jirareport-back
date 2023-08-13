const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    id: {
        type: String,
        require: true,
        unique: true
    },
    name: {
        type: String,
        require: true,
        unique: false
    },
    type: {
        type: String,
        require: false,
        unique: false
    },
    team_name: {
        type: String,
        require: false,
        unique: false
    },
    pos: {
        type: String,
        require: false,
        unique: false
    },
})

module.exports = mongoose.model('User', userSchema)