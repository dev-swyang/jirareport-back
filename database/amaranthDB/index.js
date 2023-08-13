const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()
const getHeader = require('../../api/amaranth/makeHeader')
const util = require('../../utils')

/** Amaranth10 SQLITE DB 파일 월별 UPDATE */
const db = () => {
    let exists = fs.existsSync(`../../public/orgfile_ballboy_${util.baseDate.today.substring(0, 6)}25.sqlite`)

    if (!exists) {
        util.callApi.get(
            `${process.env.AMARANTH_URL}/apiproxy/api06A03/${process.env.AMARANTH_GROUP_SEQ}`,
            getHeader(),
            {}
        ).then((res) => {
            fs.writeFileSync(`../../public/orgfile_ballboy_${util.baseDate.today.substring(0, 6)}25.sqlite`, res.data, () => { })
            return new sqlite3.Database(`../../public/orgfile_ballboy_${util.baseDate.today.substring(0, 6)}25.sqlite`)
        }).catch((err) => {
            util.err(err)
        })
    } else {
        return new sqlite3.Database(`../../public/orgfile_ballboy_${util.baseDate.today.substring(0, 6)}25.sqlite`)
    }
}

module.exports = db