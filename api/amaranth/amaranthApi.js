const util = require('../../utils')
const fs = require('fs')

const db = require('../../database/amaranthDB')
const getHeader = require('./makeHeader')
const { err } = require('../../utils')

/** 사내 그룹 외에 Amaranth10 외부 API 연동 */
const amaranthApi = {
    /** 사용자 정보 조회 Sqlite 파일 다운로드 API */
    getOrgFile: () => {
        util.callApi.post(
            `${process.env.AMARANTH_URL}/apiproxy/api06A03/${process.env.AMARANTH_GROUP_SEQ}`,
            getHeader(),
            {}
        ).then((res) => {
            fs.writeFileSync(`./public/orgfile_ballboy_${util.baseDate.today.substring(0, 6)}25.sqlite`, res.data, () => { })
        }).catch((err) => {
            util.err(err)
        })
    },
    /** 사용자 조회 API */
    getUserInfo: (searchType, users) => {
        let query =
            `SELECT ` +
            `   DISTINCT EMP.EMP_SEQ, ` +
            `   EMP.LOGIN_ID, ` +
            `   EMP_MULTI.EMP_NAME, ` +
            `   EMP_DEPT.DEPT_SEQ ` +
            `FROM ` +
            `   T_CO_EMP EMP ` +
            `   LEFT JOIN T_CO_EMP_MULTI AS EMP_MULTI ON EMP.EMP_SEQ = EMP_MULTI.EMP_SEQ ` +
            `   LEFT JOIN T_CO_EMP_DEPT AS EMP_DEPT ON EMP.EMP_SEQ = EMP_DEPT.EMP_SEQ ` +
            `WHERE ` +
            `   EMP_MULTI.EMP_NAME <> '' AND `

        const user = typeof users === 'string' ? [users] : users.join(`', '`)

        switch (searchType) {
            case 'userId':
                query += `LOWER(EMP.LOGIN_ID) IN ('${user}') `
                break;
            case 'userName':
                query += `EMP_MULTI.EMP_NAME IN ('${user}') `
                break;
            case 'userSeq':
                query += `EMP.EMP_SEQ IN ('${user}') `
                break;
        }

        return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (err) reject(err)

                resolve(rows)
                db.close()
            })
        })
    },
    /** 사내 그룹 외에 메신저 전송 API */
    sendMessage: (sendUser, recvUser, content, secuYn) => {
        util.post(
            `${process.env.AMARANTH_URL}/apiproxy/api02A02`,
            { ...getHeader(), empSeq: sendUser },
            {
                recvEmpSeq: recvUser,
                contents: content,
                contentType: 0,
                secuYn: secuYn || false ? 'Y' : 'N',
                fileId: '',
                callName: 'ERP'
            }
        ).then((res) => {
            util.log(res)
        }).catch((err) => {
            util.err(err)
        })
    },
    /** 사내 그룹외에 로그인 인증 API */
    login: async (id, password) => {
        try {
            let result = {}
            let user = await util.post(
                `${process.env.AMARANTH_URL}/apiproxy/api03A06`,
                { ...getHeader },
                {
                    loginId: id,
                    loginPasswd: password
                }
            )

            if ((user.data.err || '') !== '') {
                result = { err: user.data.err, id: '' }
            } else {
                result = { err: '', id: user.data.id }
            }

            return result
        } catch (err) {
            util.err(err)
        }

    }

}

module.exports = amaranthApi