/************************************/
/************ 관리자 기능 ************/
/************************************/

const router = require('express').Router()
const util = require('../utils')
const counsel = require('../api/pims/counsel')
const project = require('../api/pims/project')
const rnd = require('../api/pims/rnd')
const maintenance = require('../api/pims/maintenance')
const estimate = require('../api/pims/estimate')
const api = require('../api/jira/jiraApi')

/** jira - jiraReport 연동 API */
router.get('/pimstojira', async (req, res, next) => {
    try {
        util.log('pimsToService Start')

        switch (req.query.fg) {
            case '상담등록':
                let result1 = await counsel()
                api.counsel(result1)
                break;
            case '프로젝트등록':
                let result2 = await project()
                api.project(result2)
                break;
            case '연구개발등록':
                let result3 = await rnd()
                api.rnd(result3)
                break;
            case '고객유지보수':
                let result4 = await maintenance()
                api.maintenance(result4)
                break;
            case '견적등록':
                let result5 = await estimate()
                api.estimate(result5)
                break;
            case '서버연동':
                api.reportServerInterlock()
        }

        util.log('pimsToService End')

        res.status(201).json({ result: result.length })
    } catch (err) {
        util.err(err)
        next(err)
    }
})