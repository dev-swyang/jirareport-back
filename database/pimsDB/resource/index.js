const fs = require('fs')

const pimsDB = {
    query: (filename) => {
        return fs.readFileSync(`${__dirname}/${filename}.sql`, 'utf8')
    }
}

module.exports = pimsDB