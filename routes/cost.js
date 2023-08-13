/*************************************/
/************** 투입공수 **************/
/*************************************/

const router = require('express').Router()
const util = require('../utils')
const Timedate = require('../database/jiraReportDB/timedate')
const User = require('../database/jiraReportDB/user')

/** 투입 공수 조회 API */
router.get('/selectCost', async (req, res, next) => {
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

        let result = await Timedate.aggregate([{
            $match: {
                $and: [
                    { date: { $gte: `${dt_base.substring(0, 4)}0101` } },
                    { date: { $lte: `${dt_base.substring(0, 4)}1231` } }
                ],
                'id': { $in: _id },
            }
        }, {
            $project: {
                _id: false,
                id: '$id',
                date: '$date',
                category: '$category',
                time: '$time'
            }
        }, {
            $group: {
                _id: {
                    id: '$id',
                    L: '$category.l',
                    M: '$category.m',
                    S: '$category.s',
                },
                M1: {
                    $sum: {
                        $cond: [{ $eq: [{ $substr: ['$date', 4, 2] }, '01'] }, 1, 0]
                    }
                },
                M2: {
                    $sum: {
                        $cond: [{ $eq: [{ $substr: ['$date', 4, 2] }, '02'] }, 1, 0]
                    }
                },
                M3: {
                    $sum: {
                        $cond: [{ $eq: [{ $substr: ['$date', 4, 2] }, '03'] }, 1, 0]
                    }
                },
                M4: {
                    $sum: {
                        $cond: [{ $eq: [{ $substr: ['$date', 4, 2] }, '04'] }, 1, 0]
                    }
                },
                M5: {
                    $sum: {
                        $cond: [{ $eq: [{ $substr: ['$date', 4, 2] }, '05'] }, 1, 0]
                    }
                },
                M6: {
                    $sum: {
                        $cond: [{ $eq: [{ $substr: ['$date', 4, 2] }, '06'] }, 1, 0]
                    }
                },
                M7: {
                    $sum: {
                        $cond: [{ $eq: [{ $substr: ['$date', 4, 2] }, '07'] }, 1, 0]
                    }
                },
                M8: {
                    $sum: {
                        $cond: [{ $eq: [{ $substr: ['$date', 4, 2] }, '08'] }, 1, 0]
                    }
                },
                M9: {
                    $sum: {
                        $cond: [{ $eq: [{ $substr: ['$date', 4, 2] }, '09'] }, 1, 0]
                    }
                },
                M10: {
                    $sum: {
                        $cond: [{ $eq: [{ $substr: ['$date', 4, 2] }, '10'] }, 1, 0]
                    }
                },
                M11: {
                    $sum: {
                        $cond: [{ $eq: [{ $substr: ['$date', 4, 2] }, '11'] }, 1, 0]
                    }
                },
                M12: {
                    $sum: {
                        $cond: [{ $eq: [{ $substr: ['$date', 4, 2] }, '12'] }, 1, 0]
                    }
                },

            }
        }, {
            $lookup: {
                from: 'users',
                localField: '_id.id',
                foreignField: 'id',
                as: 'issue_id_team'
            }
        }, {
            $project: {
                _id: false,
                NAME: '$issue_id_team.name',
                PART: '$issue_id_team.team_name',
                CATEGORY_L: '$_id.L',
                CATEGORY_M: '$_id.M',
                CATEGORY_S: '$_id.S',
                M1: '$M1',
                M2: '$M2',
                M3: '$M3',
                M4: '$M4',
                M5: '$M5',
                M6: '$M6',
                M7: '$M7',
                M8: '$M8',
                M9: '$M9',
                M10: '$M10',
                M11: '$M11',
                M12: '$M12',
            }
        }, { $unwind: '$NAME' }, { $unwind: '$PART' }, {
            $sort: { NAME: 1 }
        }])

        res.status(201).json(result)

    } catch (err) {
        util.err(err)
        next(err)
    }
})

module.exports = router