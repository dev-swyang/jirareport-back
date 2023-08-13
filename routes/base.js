const router = require('express').Router()
const cors = require('cors')
const User = require('../database/jiraReportDB/user')
const Timedate = require('../database/jiraReportDB/timedate')
const util = require('../utils')
const amaranthApi = require('../api/amaranth/amaranthApi')

router.use(cors({
    credentials: true
}))

/** 사원정보 API */
router.get('/name', async (req, res, next) => {
    try {
        const { team, id } = req.query

        let query = {}
        if ((team || '').length === 0 || team === '부서|') {
            query = { team_name: { $nin: [] } }
        } else {
            query = { team_name: { $in: team.split('|').filter((v1) => { return (v1 || '') !== '' }) } }
        }

        let result = await User.aggregate([{
            $match: query
        }, {
            $project: {
                _id: false,
                NAME: '$name',
                ID: '$id',
                TEAM: '$team_name'
            }
        }, {
            $sort: { NAME: 1 }
        }])

        res.status(201).json(result)
    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** 로그인 API */
router.get('/login', async (req, res, next) => {
    try {
        const { id, password } = req.query

        let result = await amaranthApi.login()

        if (result.err) {
            next(result.err)
        }
        let user = await User.find({ id: result.id }, { _id: false, id: true, admin: true })

        res.status(201).json(user.length > 0 ? user : { id: '' })

    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** 업무 분류 API */
router.get('/category', async (req, res, next) => {
    try {
        let result = await Timedate.aggregate([{
            $group: { _id: '$category' }
        }, {
            $project: {
                _id: false,
                category: { $concat: ['$_id.l', '_', '$_id.m', '_', '$_id.s'] }
            }
        }])

        res.status(201).json(result)
    } catch (err) {
        util.err(err)
        next(err)
    }
})

module.exports = router