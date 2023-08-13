const crypto = require('crypto')
const util = require('../../utils')

/** Amaranth10 외부 API 인증을 위한 API Header데이터 생성*/
const getHeader = () => {
    let timeStamp = + new Date()
    let TRANSACTRION_ID = util.makeRandomNum(30)
    const { AMARANTH_ACCESS_TOKEN, AMARANTH_HASH_KEY, AMARANTH_CALLER_NAME, AMARANTH_GROUP_SEQ } = process.env

    const header = {
        'Content-type': 'application/json',
        'timestamp': timeStamp,
        'transaction-id': TRANSACTRION_ID,
        'Authorization': `Bearer ${AMARANTH_ACCESS_TOKEN}`,
        'wehago-sign': crypto.createHmac('sha256', AMARANTH_HASH_KEY).update(`${AMARANTH_ACCESS_TOKEN}${TRANSACTRION_ID}${timeStamp}/apiproxy/api06A03`).digest("base64"),
        'callerName': AMARANTH_CALLER_NAME,
        "groupSeq": AMARANTH_GROUP_SEQ
    }

    return header
}

module.exports = getHeader