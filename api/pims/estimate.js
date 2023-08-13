const { Connection, Request, TYPES } = require('tedious')
const config = require('../../database/pimsDB')
const util = require('../../utils')

let gridResult = []

/** PIMS 데이터 조회 API */
/** 더존비즈온사에서 개발된 PIMS 시스템 데이터 조회 API */
/** 견적등록 업무 관련 데이터 조회 */
const estimate = () => {
    return new Promise((resolve, reject) => {
        let conn = new Connection(config.option)

        conn.on('connect', (err) => {
            if (err) { reject(err) }
            // console.log('##### connected #####')

            let request = new Request(config.query.query('estimate'), function (err) { if (err) { reject(err) } });

            request.addParameter('date', TYPES.NVarChar, util.baseDate.today)

            request.on('row', (columns) => {
                gridResult.push(util.getRow(columns))

            })

            request.on('doneInProc', (rowCount, more, rows) => {
                resolve(gridResult)
            })

            conn.execSql(request)
        })

        conn.on('error', (err) => {
            console.log(err)
        })

        conn.connect()
    })
}

module.exports = estimate