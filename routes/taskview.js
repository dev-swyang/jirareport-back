/*************************************/
/************** 타임라인 **************/
/*************************************/

// const Issue = require('')
const router = require('express').Router()
const util = require('../utils')
const Issue = require('../database/jiraReportDB/issue')
const User = require('../database/jiraReportDB/user')

/** 사원별 타임라인 업무1 API */
router.get('/data_table', async (req, res, next) => {
    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg } = req.query

        let query = {}
        if ((team || '').length === 0) {
            query = { team_name: { $nin: [] } }
        } else if ((id || '').length === 0) {
            query = { team_name: { $in: team.split('|').filter((v1) => { return (v1 || '') !== '' }) } }
        } else {
            query = { id: { $in: id.split('|').filter((v1) => { return (v1 || '') !== '' }) } }
        }

        let _id = (await User.find(query, { _id: false, id: true })).map((v) => { return v.id })

        let result = await Issue.aggregate([{
            $match: {
                'date.dt_start': { $nin: ['', null] },
                'id.id_assign': { $in: _id },
                $or: [
                    { $eq: [{ $ifNull: ['$group', ''] }, '연구개발'], $ne: [{ $ifNull: ['$type', ''] }, ''] },
                    { $eq: [{ $ifNull: ['$group', ''] }, '연구개발'] }
                ],
                $or: [
                    {
                        $and: [
                            { 'date.dt_end': { $gte: dt_start } },
                            { 'date.dt_end': { $lte: dt_end } }
                        ]
                    }, {
                        $and: [
                            { 'date.dt_start': { $gte: dt_start } },
                            { 'date.dt_start': { $lte: dt_end } }
                        ]
                    }, {
                        $and: [
                            { 'date.dt_start': { $gt: dt_start } },
                            { 'date.dt_end': { $in: ['', null] } }
                        ]
                    }
                ],
            }
        }, {
            $group: {
                _id: { group: '$group', type: '$type', status: '$status' },
                cnt: { $sum: 1 }
            }
        }, {
            $project: {
                _id: false,
                status: '$_id.status',
                type: '$_id.type',
                group: '$_id.group',
                fg: {
                    $switch: {
                        branches: [
                            { case: { $in: ['$_id.status', ['견적요청(PIMS)', '할일', '확인예정(PIMS)']] }, then: '할일' },
                            { case: { $in: ['$_id.status', ['진행중(In Progress)', '확인중(PIMS)', '개발예정(PIMS)', '개발중(In Progress)', '설계중(In Progress)', '수정예정(PIMS)', '수정완료(PIMS)', '1차테스트(PIMS)', '2차테스트(PIMS)', '검토예정(PIMS)', '견적작성(PIMS)']] }, then: '진행중' },
                        ],
                        default: '완료'
                    }
                },
                cnt: '$cnt'
            }
        }, {
            $group: {
                _id: '$fg',
                'Amaranth10': {
                    $sum: { $cond: [{ $eq: ['$type', 'Amaranth10'] }, '$cnt', 0] }
                },
                '프로젝트(iCUBE)': {
                    $sum: { $cond: [{ $eq: ['$type', '프로젝트(iCUBE)'] }, '$cnt', 0] }
                },
                '패키지유지보수(iCUBE)': {
                    $sum: { $cond: [{ $eq: ['$type', '패키지유지보수(iCUBE)'] }, '$cnt', 0] }
                },
                '전용개발(iCUBE)': {
                    $sum: { $cond: [{ $eq: ['$type', '전용개발(iCUBE)'] }, '$cnt', 0] }
                },
                '전용개발유지보수(iCUBE)': {
                    $sum: { $cond: [{ $eq: ['$type', '전용개발유지보수(iCUBE)'] }, '$cnt', 0] }
                },
                'BizBox Alpha': {
                    $sum: { $cond: [{ $eq: ['$type', 'BizBox Alpha'] }, '$cnt', 0] }
                },
                '단위업무': {
                    $sum: { $cond: [{ $eq: ['$group', '단위업무'] }, '$cnt', 0] }
                },
                '상담': {
                    $sum: { $cond: [{ $eq: ['$group', '상담'] }, '$cnt', 0] }
                },
                '견적': {
                    $sum: { $cond: [{ $eq: ['$group', '견적'] }, '$cnt', 0] }
                },
                SUM_CNT: { $sum: 1 }
            }
        }, {
            $project: {
                FG: '$_id',
                DEV1: '$Amaranth10',
                DEV2: '$프로젝트(iCUBE)',
                DEV3: '$패키지유지보수(iCUBE)',
                DEV4: '$전용개발(iCUBE)',
                DEV5: '$전용개발유지보수(iCUBE)',
                DEV6: '$BizBox Alpha',
                JOB: '$단위업무',
                TAL: '$상담',
                REQ: '$견적',
                SUM_CNT: '$SUM_CNT',
            }
        }])

        res.status(201).json(result)
    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** 사원별 타임라인 업무2 API */
router.get('/grid_data_tab', async (req, res, next) => {
    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg } = req.query

        let query = {}
        if ((team || '').length === 0) {
            query = { team_name: { $nin: [] } }
        } else if ((id || '').length === 0) {
            query = { team_name: { $in: team.split('|').filter((v1) => { return (v1 || '') !== '' }) } }
        } else {
            query = { id: { $in: id.split('|').filter((v1) => { return (v1 || '') !== '' }) } }
        }

        let _id = (await User.find(query, { _id: false, id: true })).map((v) => { return v.id })

        let result = await Issue.aggregate([{
            $match: {
                type: { $nin: ['', null] },
                'date.dt_start': { $nin: ['', null] },
                'id.id_assign': { $in: _id },
                status: { $in: ['견적요청(PIMS)', '할일', '확인예정(PIMS)'] },
                $or: [
                    {
                        $and: [
                            { 'date.dt_end': { $gte: dt_start } },
                            { 'date.dt_end': { $lte: dt_end } }
                        ]
                    }, {
                        $and: [
                            { 'date.dt_start': { $gte: dt_start } },
                            { 'date.dt_start': { $lte: dt_end } }
                        ]
                    }, {
                        $and: [
                            { 'date.dt_start': { $gt: dt_start } },
                            { 'date.dt_end': { $in: ['', null] } }
                        ]
                    }
                ],
            }
        }, {
            $lookup: {
                from: 'users',
                localField: 'id.id_attends',
                foreignField: 'id',
                as: 'issue_id_team'
            }
        }, {
            $project: {
                _id: false,
                name: '$issue_id_team.name',
                group: '$group',
                type: '$type',
                key: '$key',
                status: { $ifNull: ['$status', ''] },
                summary: { $ifNull: ['$summary', ''] },
                dt_due: { $ifNull: ['$date.dt_due', ''] },
                dt_start: { $ifNull: ['$date.dt_start', ''] },
                dt_end: { $ifNull: ['$date.dt_end', ''] },
            }
        }, { $unwind: '$name' }, {
            $project: {
                NAME: '$name',
                GROUP: '$group',
                TYPE: '$type',
                KEY: '$key',
                SUMMARY: '$summary',
                STATUS: '$status',
                DT_DUE: '$dt_due',
                DT_START: '$dt_start',
                DT_END: '$dt_end',
            }
        }, { $sort: { NAME: 1 } }])

        console.log(result)

        res.status(201).json(result)
    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** 사원별 타임라인 업무1 Chart API */
router.get('/chart1', async (req, res, next) => {
    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg } = req.query

        let query = {}
        if ((team || '').length === 0) {
            query = { team_name: { $nin: [] } }
        } else if ((id || '').length === 0) {
            query = { team_name: { $in: team.split('|').filter((v1) => { return (v1 || '') !== '' }) } }
        } else {
            query = { id: { $in: id.split('|').filter((v1) => { return (v1 || '') !== '' }) } }
        }

        let _id = (await User.find(query, { _id: false, id: true })).map((v) => { return v.id })

        let result = await Issue.aggregate([{
            $match: {
                group: '연구개발',
                type: { $nin: ['', null] },
                'date.dt_start': { $nin: ['', null] },
                'date.dt_due': { $nin: ['', null] },
                status: { $nin: ['보류(Hold)', '완료(Resolve)', '수정불가(PIMS)', '업데이트대기(PIMS)', '업데이트완료(PIMS)', '원격지원(PIMS)', '장기수정(PIMS)', '확인완료(PIMS)', '견적보류(PIMS)', '견적완료(PIMS)', '업데이트완료(PIMS)', '완료(Resolve)', '최종테스트(PIMS)', '2차테스트(PIMS)'] },
                'id.id_assign': { $in: _id },
                $or: [
                    {
                        $and: [
                            { 'date.dt_end': { $gte: dt_start } },
                            { 'date.dt_end': { $lte: dt_end } }
                        ]
                    }, {
                        $and: [
                            { 'date.dt_start': { $gte: dt_start } },
                            { 'date.dt_start': { $lte: dt_end } }
                        ]
                    }, {
                        $and: [
                            { 'date.dt_start': { $gt: dt_start } },
                            { 'date.dt_end': { $in: ['', null] } }
                        ]
                    }
                ],
            }
        }, {
            $group: {
                _id: '$type',
                cnt: { $sum: 1 },
            }
        }, { $sort: { cnt: 1 } }])

        res.status(201).json(util.makeChartForm(result))
    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** 사원별 타임라인 업무2 chart2 API */
router.get('/chart2', async (req, res, next) => {
    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg } = req.query

        let query = {}
        if ((team || '').length === 0) {
            query = { team_name: { $nin: [] } }
        } else if ((id || '').length === 0) {
            query = { team_name: { $in: team.split('|').filter((v1) => { return (v1 || '') !== '' }) } }
        } else {
            query = { id: { $in: id.split('|').filter((v1) => { return (v1 || '') !== '' }) } }
        }

        let _id = (await User.find(query, { _id: false, id: true })).map((v) => { return v.id })

        let result = await Issue.aggregate([{
            $match: {
                type: { $nin: ['', null] },
                'date.dt_start': { $nin: ['', null] },
                'status': { $in: ['견적요청(PIMS)', '할일', '확인예정(PIMS)', '진행중(In Progress)', '확인중(PIMS)', '개발예정(PIMS)', '개발중(In Progress)', '설계중(In Progress)', '수정예정(PIMS)', '수정완료(PIMS)', '1차테스트(PIMS)', '2차테스트(PIMS)', '검토예정(PIMS)', '견적작성(PIMS)'] },
                'id.id_assign': { $in: _id },
                $or: [
                    {
                        $and: [
                            { 'date.dt_end': { $gte: dt_start } },
                            { 'date.dt_end': { $lte: dt_end } }
                        ]
                    }, {
                        $and: [
                            { 'date.dt_start': { $gte: dt_start } },
                            { 'date.dt_start': { $lte: dt_end } }
                        ]
                    }, {
                        $and: [
                            { 'date.dt_start': { $gt: dt_start } },
                            { 'date.dt_end': { $in: ['', null] } }
                        ]
                    }
                ],
            }
        }, {
            $unwind: '$id.id_attends'
        }, {
            $lookup: {
                from: 'users',
                localField: 'id.id_attends',
                foreignField: 'id',
                as: 'issue_id_team'
            }
        }, {
            $project: {
                _id: false,
                team: '$issue_id_team.team_name',
                status: { $cond: [{ $in: ['$status', ['견적요청(PIMS)', '할일', '확인예정(PIMS)']] }, '할일', '진행중'] }
            }
        }, {
            $unwind: '$team'
        }, {
            $group: {
                _id: '$team',
                '할일': { $sum: { $cond: [{ $eq: ['$status', '할일'] }, 1, 0] } },
                '진행중': { $sum: { $cond: [{ $eq: ['$status', '진행중'] }, 1, 0] } }
            }
        }])

        res.status(201).json(util.makeChartForm(result))
    } catch (err) {
        util.err(err)
        next(err)
    }
})

module.exports = router