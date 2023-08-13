const counsel = require('../api/pims/counsel')
const project = require('../api/pims/project')
const rnd = require('../api/pims/rnd')
const maintenance = require('../api/pims/maintenance')
const estimate = require('../api/pims/estimate')

const util = require('../utils')
const api = require('../api/jira/jiraApi')

/** 업무별 데이터 연동 */
/** tedious lib를 사용한 MSSQL 데이터 조회 */
const pimsToJira = () => {
    setInterval(async () => {
        try {
            // setTimeout(async () => {

            util.log('pimsToService Start')

            // 상담등록
            let result1 = await counsel()
            api.counsel(result1)

            // 프로젝트드록
            let result2 = await project()
            api.project(result2)

            // 연구개발등록
            let result3 = await rnd()
            api.rnd(result3)

            // 고객유지보수
            let result4 = await maintenance()
            api.maintenance(result4)

            // 견적등록
            let result5 = await estimate()
            api.estimate(result5)

            // 리포트 서버 연동
            api.reportServerInterlock()

            util.log('pimsToService End')

        } catch (err) {
            util.err(err)
        }
    }, 60 * 60 * 1000);
}

// pimsToJira()
module.exports = pimsToJira