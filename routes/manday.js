/************************************/
/********** 종합현황 - Tab3 **********/
/************************************/

// const Issue = require('')
const router = require('express').Router()
const util = require('../utils')
const Timedate = require('../database/jiraReportDB/timedate')

/** 업무 순위 API */
router.get('/selectRank', async (req, res, next) => {
    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg } = req.query

        let result = await Timedate.aggregate([{
            $match: {
                date: { $gte: dt_start },
                date: { $lte: dt_end },
                time: { $nin: ['', null, 0] }
            }
        }, {
            $group: {
                _id: { l: '$category.l', m: '$category.m', s: '$category.s', id: '$id' },
                time_sum: { $sum: { $cond: [{ $in: ['$time', [null, '', 0, '0']] }, 0, '$time'] } },
            }
        }, { $addFields: { cnt: 1 } }, {
            $group: {
                _id: {
                    l: '$_id.l',
                    m: '$_id.m',
                    s: '$_id.s',
                },
                category_l: { $first: '$_id.l' },
                category_m: { $first: '$_id.m' },
                category_s: { $first: '$_id.s' },
                cnt: { $sum: '$cnt' },
                time_sum: { $sum: '$time_sum' }
            }
        }, {
            $addFields: {
                md: {
                    $round: [{ $cond: [{ $eq: ['$cnt', 0] }, 0, { $divide: [{ $divide: ['$time_sum', 8] }, '$cnt'] }] }, 1]
                }
            }
        }, { $sort: { cnt: -1 } }, { $limit: 3 }, {
            $project: {
                _id: false,
                CATEGORY_L: '$category_l',
                CATEGORY_M: '$category_m',
                CATEGORY_S: '$category_s',
                CNT: '$cnt',
                TIME_SUM: '$time_sum',
                MD: '$md',
            }
        }])

        res.status(201).json(result.map((v, i) => { return { RANK: (i + 1), ...v } }))
    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** 카테고리별 업무 순위 API */
router.get('/selectRankLMS', async (req, res, next) => {
    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg, lms_fg } = req.query

        let result = await Timedate.aggregate([{
            $match: {
                date: { $gte: dt_start },
                date: { $lte: dt_end },
                time: { $nin: ['', null, 0, '0'] }
            }
        }, {
            $group: {
                _id: {
                    category: {
                        $switch: {
                            branches: [
                                { case: { $eq: [lms_fg, 'M'] }, then: '$category.m' },
                                { case: { $eq: [lms_fg, 'S'] }, then: '$category.s' },
                            ],
                            default: '$category.l'
                        }
                    },
                    id: '$id'
                },
                time_sum: { $sum: { $ifNull: ['$time', 0] } }
            }
        }, { $addFields: { cnt: 1 } }, {
            $project: {
                _id: false,
                category: '$_id.category',
                cnt: '$cnt',
                time_sum: '$time_sum'
            }
        }, {
            $group: {
                _id: '$category',
                cnt: { $sum: '$cnt' },
                time_sum: { $sum: '$time_sum' }
            }
        }, {
            $addFields: {
                md: { $round: [{ $cond: [{ $eq: ['$cnt', 0] }, 0, { $divide: [{ $divide: ['$time_sum', 8] }, '$cnt'] }] }, 1] },
            }
        }, { $sort: { cnt: -1 } }, {
            $project: {
                CATEGORY: '$_id',
                CNT: '$cnt',
                TIME_SUM: '$time_sum',
                MD: '$md',
            }
        }])

        res.status(201).json(result)
    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** 카테고리별 업무 순위 Chart 데이터 API */
router.get('/selectRankLMSChart', async (req, res, next) => {
    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg, lms_fg } = req.query

        let result = await Timedate.aggregate([{
            $match: {
                date: { $gte: dt_start },
                date: { $lte: dt_end },
                time: { $nin: ['', null, 0, '0'] }
            }
        }, {
            $group: {
                _id: {
                    category: {
                        $switch: {
                            branches: [
                                { case: { $eq: [lms_fg, 'M'] }, then: '$category.m' },
                                { case: { $eq: [lms_fg, 'S'] }, then: '$category.s' },
                            ],
                            default: '$category.l'
                        }
                    },
                    id: '$id'
                },
                time_sum: { $sum: { $ifNull: ['$time', 0] } }
            }
        }, { $addFields: { cnt: 1 } }, {
            $project: {
                _id: false,
                category: '$_id.category',
                cnt: '$cnt',
                time_sum: '$time_sum'
            }
        }, {
            $group: {
                _id: '$category',
                cnt: { $sum: '$cnt' },
                time_sum: { $sum: '$time_sum' }
            }
        }, {
            $addFields: {
                md: { $round: [{ $cond: [{ $eq: ['$cnt', 0] }, 0, { $divide: [{ $divide: ['$time_sum', 8] }, '$cnt'] }] }, 1] },
            }
        }, { $sort: { cnt: -1 } }, {
            $project: {
                _id: false,
                CATEGORY: '$_id',
                MD: '$md',
            }
        }, { $sort: { CATEGORY: 1 } }])

        res.status(201).json(util.makeChartForm(result))
    } catch (err) {
        util.err(err)
        next(err)
    }
})

module.exports = router