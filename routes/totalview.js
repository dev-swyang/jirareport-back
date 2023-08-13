/************************************/
/********** 종합현황 - Tab2 **********/
/************************************/

// const Issue = require('')
const router = require('express').Router()
const util = require('../utils')
const Issue = require('../database/jiraReportDB/issue')

/** 종합 데이터 Chart1 API */
router.get('/chart1', async (req, res, next) => {
    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg } = req.query

        let result = await Issue.aggregate([{
            $match: {
                group: { $nin: ['', null] },
                'date.dt_start': { $nin: ['', null] },
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
                ]
            }
        }, {
            $group: {
                _id: '$group',
                cnt: { $sum: 1 }
            }
        }])

        res.status(201).json(util.makeChartForm(result))
    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** 종합 데이터 Chart2 API */
router.get('/chart2', async (req, res, next) => {
    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg } = req.query

        let result = await Issue.aggregate([{
            $project: {
                _id: false,
                group: true,
                id: '$id.id_attends',
                date: {
                    dt_start: true,
                    dt_end: true
                }
            }
        }, { $unwind: '$id' }, {
            $match: {
                group: { $nin: ['', null] },
                'date.dt_start': { $nin: ['', null] },
                $or: [
                    {
                        $and: [
                            { 'date.dt_end': { $gte: '20210101' } },
                            { 'date.dt_end': { $lte: '20211231' } }
                        ]
                    }, {
                        $and: [
                            { 'date.dt_start': { $gte: '20210101' } },
                            { 'date.dt_start': { $lte: '20211231' } }
                        ]
                    }, {
                        $and: [
                            { 'date.dt_start': { $gt: '20210101' } },
                            { 'date.dt_end': { $in: ['', null] } }
                        ]
                    }
                ]
            }
        }, {
            $lookup: {
                from: 'users',
                localField: 'id',
                foreignField: 'id',
                as: 'issue_id_team'
            }
        }, {
            $project: {
                group: true,
                team: '$issue_id_team.team_name'
            }
        }, { $unwind: '$team' }, {
            $group: {
                _id: '$team',
                '연구개발': {
                    $sum: { $cond: [{ $eq: ['$group', '연구개발'] }, 1, 0] }
                },
                '단위업무': {
                    $sum: { $cond: [{ $eq: ['$group', '단위업무'] }, 1, 0] }
                },
                '상담': {
                    $sum: { $cond: [{ $eq: ['$group', '상담'] }, 1, 0] }
                },
                '견적': {
                    $sum: { $cond: [{ $eq: ['$group', '견적'] }, 1, 0] }
                },
            }
        }])

        res.status(201).json(util.makeChartForm(result))
    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** 종합 데이터 Chart3 API */
router.get('/chart3', async (req, res, next) => {
    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg } = req.query

        let result = await Issue.aggregate([{
            $match: {
                group: { $nin: ['', null] },
                'date.dt_start': { $nin: ['', null] },
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
                ]
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
                type: '$type',
                name: '$issue_id_team.name'
            }
        }, { $unwind: '$name' }, {
            $group: {
                _id: '$name',
                count: { $sum: { $cond: [{ $in: ['$type', ['Amaranth10', '전용개발(iCUBE)', '전용개발유지보수(iCUBE)', '패키지유지보수(iCUBE)', '프로젝트(iCUBE)']] }, 1, 0] } },
                'Amaranth10': {
                    $sum: { $cond: [{ $eq: ['$type', 'Amaranth10'] }, 1, 0] }
                },
                '전용개발(iCUBE)': {
                    $sum: { $cond: [{ $eq: ['$type', '전용개발(iCUBE)'] }, 1, 0] }
                },
                '전용개발유지보수(iCUBE)': {
                    $sum: { $cond: [{ $eq: ['$type', '전용개발유지보수(iCUBE)'] }, 1, 0] }
                },
                '패키지유지보수(iCUBE)': {
                    $sum: { $cond: [{ $eq: ['$type', '패키지유지보수(iCUBE)'] }, 1, 0] }
                },
                '프로젝트(iCUBE)': {
                    $sum: { $cond: [{ $eq: ['$type', '프로젝트(iCUBE)'] }, 1, 0] }
                },
            }
        }, { $sort: { count: -1 } }, { $limit: 5 }])

        res.status(201).json(util.makeChartForm(result))
    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** 종합 데이터 Grid API */
router.get('/grid_data', async (req, res, next) => {
    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg } = req.query

        let result = await Issue.aggregate([{
            $match: {
                type: { $nin: ['', null] },
                'date.dt_start': { $nin: ['', null] },
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
            $project: {
                _id: false,
                group: '$group',
                type: '$type',
                id: '$id.id_attends',
                key: '$key',
            }
        }, { $unwind: '$id' }, {
            $lookup: {
                from: 'users',
                localField: 'id',
                foreignField: 'id',
                as: 'issue_id_team'
            }
        }, {
            $project: {
                group: '$group',
                type: '$type',
                id: '$id',
                key: '$key',
                team: '$issue_id_team.team_name'
            }
        }, { $unwind: '$team' }, {
            $group: {
                _id: '$team',
                DEV1: {
                    $sum: { $cond: [{ $and: [{ $eq: ['$group', '연구개발'] }, { $eq: ['$type', 'Amaranth10'] }] }, 1, 0] }
                },
                DEV2: {
                    $sum: { $cond: [{ $and: [{ $eq: ['$group', '연구개발'] }, { $eq: ['$type', '프로젝트(iCUBE)'] }] }, 1, 0] }
                },
                DEV3: {
                    $sum: { $cond: [{ $and: [{ $eq: ['$group', '연구개발'] }, { $eq: ['$type', '전용개발(iCUBE)'] }] }, 1, 0] }
                },
                DEV4: {
                    $sum: { $cond: [{ $and: [{ $eq: ['$group', '연구개발'] }, { $eq: ['$type', '패키지유지보수(iCUBE)'] }] }, 1, 0] }
                },
                DEV5: {
                    $sum: { $cond: [{ $and: [{ $eq: ['$group', '연구개발'] }, { $eq: ['$type', '전용개발유지보수(iCUBE)'] }] }, 1, 0] }
                },
                DEV6: {
                    $sum: { $cond: [{ $and: [{ $eq: ['$group', '연구개발'] }, { $eq: ['$type', 'BizBox Alpha'] }] }, 1, 0] }
                },
                DEV_SUM: {
                    $sum: { $cond: [{ $eq: ['$group', '연구개발'] }, 1, 0] }
                },
                JOB1: {
                    $sum: { $cond: [{ $and: [{ $eq: ['$group', '단위업무'] }, { $in: ['$type', ['상담', '교육']] }] }, 1, 0] }
                },
                JOB2: {
                    $sum: { $cond: [{ $and: [{ $eq: ['$group', '단위업무'] }, { $eq: ['$type', '영업지원'] }] }, 1, 0] }
                },
                JOB3: {
                    $sum: { $cond: [{ $and: [{ $eq: ['$group', '단위업무'] }, { $eq: ['$type', '자료제작'] }] }, 1, 0] }
                },
                JOB4: {
                    $sum: { $cond: [{ $and: [{ $eq: ['$group', '단위업무'] }, { $eq: ['$type', '자격시험'] }] }, 1, 0] }
                },
                JOB5: {
                    $sum: { $cond: [{ $and: [{ $eq: ['$group', '단위업무'] }, { $eq: ['$type', '업무협의'] }] }, 1, 0] }
                },
                JOB6: {
                    $sum: { $cond: [{ $and: [{ $eq: ['$group', '단위업무'] }, { $not: { $in: ['$type', ['상담', '교육', '영업지원', '자료제작', '자격시험', '업무협의']] } }] }, 1, 0] }
                },
                JOB_SUM: {
                    $sum: { $cond: [{ $eq: ['$group', '단위업무'] }, 1, 0] }
                },
                ADV_SUM: {
                    $sum: { $cond: [{ $eq: ['$group', '상담'] }, 1, 0] }
                },
                REQ_SUM: {
                    $sum: { $cond: [{ $eq: ['$group', '견적'] }, 1, 0] }
                },
            }
        }, { $sort: { _id: 1 } }])

        res.status(201).json(result)
    } catch (err) {
        util.err(err)
        next(err)
    }
})

module.exports = router