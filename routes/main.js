/************************************/
/********** 종합현황 - Tab1 **********/
/************************************/

// const Issue = require('')
const router = require('express').Router()
const util = require('../utils')
const Issue = require('../database/jiraReportDB/issue')
const User = require('../database/jiraReportDB/user')
const issue = require('../database/jiraReportDB/issue')

/** 총 데이터 COUNT API */
router.get('/data_cnt', async (req, res, next) => {
    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg } = req.query

        let userCnt = await User.find({}, { _id: false, id: true })
        let issueCnt = await issue.find({
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
        })

        res.status(201).json({ userCnt: userCnt.length, issueCnt: issueCnt.length })

    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** Chart1 API */
router.get('/data_chart1', async (req, res, next) => {
    util.log('/data_chart1')

    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg } = req.query
        console.log(dt_start, dt_end, group_fg)
        let group = '';

        if (group_fg === '1') {
            group = '연구개발'
        } else if (group_fg === '3') {
            group = '상담'
        } else if (group_fg === '4') {
            group = '단위업무'
        } else if (group_fg === '6') {
            group = '견적'
        }

        let result = await Issue.aggregate([{
            $match: {
                group: group,
                type: { $nin: ['', null, '프로젝트(D-ERP)', '단위업무'] },
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
            $project: {
                type: {
                    $switch: {
                        branches: [
                            { case: { $eq: [group, '견적'] }, then: '$modules' },
                            { case: { $and: [{ $eq: [group, '상담'] }, { $ne: ['$product', ''] }, { $ne: ['$product', null] }] }, then: '$product' },
                        ],
                        default: '$type'
                    }
                }
            }
        }, {
            $group: {
                _id: '$type',
                count: { $sum: 1 }
            }
        }, {
            $unwind: '$_id'
        }, { $sort: { _id: 1 } }])

        res.status(201).json(util.makeChartForm(result))
    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** Chart2 API */
router.get('/data_chart2', async (req, res, next) => {
    try {
        util.log('')
        const { dt_start, dt_end, dt_base, team, id, group_fg } = req.query

        let result = await Issue.aggregate([{
            $match: {
                group: '연구개발',
                type: { $nin: ['', null] },
                'date.dt_start': { $nin: ['', null] },
                'status': { $nin: ['완료(Resolve)', '업데이트완료(PIMS)'] },
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
                _id: {
                    status: '$status',
                    type: '$type'
                },
                cnt: { $sum: 1 }
            }
        }, {
            $group: {
                _id: '$_id.status',
                'Amaranth10': {
                    $sum: { $cond: [{ $eq: ['$_id.type', 'Amaranth10'] }, '$cnt', 0] }
                },
                '프로젝트(iCUBE)': {
                    $sum: { $cond: [{ $eq: ['$_id.type', '프로젝트(iCUBE)'] }, '$cnt', 0] }
                },
                '패키지유지보수(iCUBE)': {
                    $sum: { $cond: [{ $eq: ['$_id.type', '패키지유지보수(iCUBE)'] }, '$cnt', 0] }
                },
                '전용개발(iCUBE)': {
                    $sum: { $cond: [{ $eq: ['$_id.type', '전용개발(iCUBE)'] }, '$cnt', 0] }
                },
                '전용개발유지보수(iCUBE)': {
                    $sum: { $cond: [{ $eq: ['$_id.type', '전용개발유지보수(iCUBE)'] }, '$cnt', 0] }
                },
            }
        }, { $sort: { _id: 1 } }])

        res.status(201).json(util.makeChartForm(result))
    } catch (err) {
        util.err(err)
        next(err)
    }
})

module.exports = router