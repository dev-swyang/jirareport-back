const axios = require('axios')
const moment = require('moment')
const dateFormat = 'YYYYMMDD'

const utils = {
    baseDate: {
        /** 기초 날짜 데이터 선언 */
        today: `${moment().format(dateFormat)}`,
        monthFirstDay: `${moment().startOf('month').format(dateFormat)}`,
        monthLastDay: `${moment().endOf('month').format(dateFormat)}`,
        yearFirstDay: `${moment().startOf('year').format(dateFormat)}`,
        yearLastDay: `${moment().endOf('year').format(dateFormat)}`,
        weekMonDay: `${moment().day(1).format(dateFormat)}`,
        weekFriDay: `${moment().day(5).format(dateFormat)}`,
        quarter1: {
            from: `${moment().month(0).startOf('month').format(dateFormat)}`,
            to: `${moment().month(2).endOf('month').format(dateFormat)}`,
        },
        quarter2: {
            from: `${moment().month(3).startOf('month').format(dateFormat)}`,
            to: `${moment().month(5).endOf('month').format(dateFormat)}`,
        },
        quarter3: {
            from: `${moment().month(6).startOf('month').format(dateFormat)}`,
            to: `${moment().month(8).endOf('month').format(dateFormat)}`,
        },
        quarter4: {
            from: `${moment().month(9).startOf('month').format(dateFormat)}`,
            to: `${moment().month(11).endOf('month').format(dateFormat)}`,
        },
    },

    /** 외부 API 연동 호출  */
    callApi: {
        get: (url, params) => {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'GET',
                    url: `${process.env.REACT_APP_HOST}${url}`,
                    params: params
                })
                    .then((res) => { resolve(res) })
                    .catch((err) => { reject(err) })
            })
        },
        post: (url, headers, params) => {
            return new Promise((resolve, reject) => {
                axios({
                    method: 'POST',
                    url: `${process.env.REACT_APP_HOST}${url}`,
                    headers: headers,
                    params: params
                })
                    .then((res) => { resolve(res) })
                    .catch((err) => { reject(err) })
            })
        }
    },
    /** 입력 데이터 차트 Form 변환 */
    makeChartForm: (data) => {
        return [Object.keys(data[0]), ...data.map((v1) => { return Object.keys(v1).map((v2) => { return v1[v2] }) })]
    },

    /** 랜덤 문자열 생성 - Amaranth10 외부 API연동시 사용 */
    makeRandomNum: (length) => {
        const string = '0123456789abcdefghijklmnopqrstuvwxyz'

        let randomNum = ''
        for (let i = 0; i < parseInt(length); i++) {
            let num = Math.floor(Math.random() * string.length)
            randomNum += string[num]
        }

        return randomNum
    },
    log: (msg) => {
        console.log(`[${moment().format('YYYY-MM-DD')}] [DEBUG] => ${msg}`)
        // 로그 기록
    },
    err: (msg, code) => {
        console.log(`[${moment().format('YYYY-MM-DD')}] [ERROR${code ? ` / ${code}` : ''}] => ${msg}`)
        // 로그 기록
    }
}

module.exports = utils