/************************************/
/************ 일일업무보고 ************/
/************************************/

const router = require('express').Router()
const util = require('../utils')
const Issue = require('../database/jiraReportDB/issue')
const Timedate = require('../database/jiraReportDB/timedate')

/** 근무시간 현황 API */
router.get('/timedate', async (req, res, next) => {
    try {
        const { dt_base, id } = req.query

        let result = await Timedate.aggregate([{
            $match: {
                $and: [
                    { date: { $gte: `${dt_base.substring(0, 6)}01` } },
                    { date: { $lte: `${dt_base.substring(0, 6)}31` } }
                ],
                id: id,
                time: { $nin: ['0', '', 0, null] }
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
                _id: false,
                NAME: '$issue_id_team.name',
                DATE: '$date',
                CATEGORY: { $concat: ['$category.l', '/', '$category.m', '/', '$category.s'] },
                TIME: '$time'
            }
        }, { $unwind: '$NAME' }, { $sort: { DATE: 1, TIME: 1 } }])

        res.status(201).json(result)

    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** 투입 업무 조회 API */
router.get('/working', async (req, res, next) => {
    try {
        const { dt_base, id } = req.query

        let result = await Issue.aggregate([{
            $match: {
                group: { $in: ['단위업무', '연구개발'] },
                $or: [
                    {
                        $and: [
                            { 'date.dt_start': { $gte: `${dt_base.substring(0, 6)}01` } },
                            { 'date.dt_start': { $lte: dt_base } }
                        ]
                    }, {
                        $and: [
                            { 'date.dt_end': { $lte: `${dt_base.substring(0, 6)}31` } },
                            { 'date.dt_end': { $gte: dt_base } },
                        ]
                    }
                ]
            }
        }, { $unwind: '$id.id_attends' }, {
            $match: {
                'id.id_attends': id
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
                NAME: '$issue_id_team.name',
                PRODUCT: '$product',
                KEY: '$key',
                SUMMARY: '$summary',
                STATUS: '$status',
                DT_START: '$date.dt_start',
                DT_END: '$dt_end',

            }
        }, { $unwind: '$NAME' }])

        res.status(201).json(result)
    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** 근무시간 등록 API */
router.get('/updateTimeDate', async (req, res, next) => {
    try {
        const { id, date, category, time, totalTime } = req.query
        let lms = category.split('_')

        let result = await Timedate.create({
            date: date,
            id: id,
            category: {
                l: lms[0] || '',
                m: lms[1] || '',
                s: lms[2] || '',
            },
            time: time,
            totalTime: totalTime
        })

        res.status(201).json(result)

    } catch (err) {
        util.err(err)
        next(err)
    }
})

module.exports = router