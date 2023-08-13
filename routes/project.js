/*************************************/
/************ 프로젝트현황 ************/
/*************************************/

// const Issue = require('')
const router = require('express').Router()
const util = require('../utils')
const Issue = require('../database/jiraReportDB/issue')
const User = require('../database/jiraReportDB/user')

/** 프로젝트 상태별 조회 API */
router.get('/status_list', async (req, res, next) => {
    try {
        const { dt_start, dt_end, dt_base, team, id, group_fg } = req.query

        let result = await Issue.aggregate([{
            $match: { group: group_fg }
        }, {
            $group: {
                _id: { group: '$group', status: '$status' },
                cnt: { $sum: 1 }
            }
        }, {
            $project: {
                _id: false,
                group: '$_id.group',
                status: '$_id.status'
            }
        }, {
            $sort: { group: 1 }
        }])

        res.status(201).json(result)
    } catch (err) {
        util.err(err)
        next(err)
    }
})

/** 프로젝트별 업무 API */
router.get('/list', async (req, res, next) => {
    try {
        const { dt_start, dt_end, team, id, group_fg, status } = req.query
        let project;

        let _status = status.length === 0 ? { $nin: [] } : { $in: status.split('|').filter((v1) => { return (v1 || '') !== '' }) }
        let query = {}
        if ((team || '').length === 0) {
            query = { team_name: { $nin: [] } }
        } else if ((id || '').length === 0) {
            query = { team_name: { $in: team.split('|').filter((v1) => { return (v1 || '') !== '' }) } }
        } else {
            query = { id: { $in: id.split('|').filter((v1) => { return (v1 || '') !== '' }) } }
        }

        let _id = (await User.find(query, { _id: false, id: true })).map((v) => { return v.id })

        switch (group_fg) {
            case '단위업무':
                project = {
                    _id: false,
                    NAME: '$issue_id_team.name',
                    TYPE: '$type',
                    SUMMARY: '$summary',
                    STATUS: '$status',
                    DT_START: '$date.dt_start',
                    DT_END: '$date.dt_end',
                    DT_DUE: '$date.dt_due',
                }
                break;
            case '연구개발(Amaranth10)':
            case '연구개발(패키지)':
                project = {
                    _id: false,
                    NAME: '$issue_id_team.name',
                    EPIC_NAME: '$epic.epic_name',
                    SUMMARY: '$summary',
                    STATUS: '$status',
                    DT_START: '$date.dt_start',
                    DT_END: '$date.dt_end',
                    DT_DUE: '$date.dt_due',
                }
                break;
            case '연구개발(전용개발)':
                project = {
                    _id: false,
                    NAME: '$issue_id_team.name',
                    TRADE: '$trade',
                    SUMMARY: '$summary',
                    STATUS: '$status',
                    DT_START: '$date.dt_start',
                    DT_END: '$date.dt_end',
                    DT_DUE: '$date.dt_due',
                }
                break;
            case 'Bizbox Alpha':
                project = {
                    _id: false,
                    NAME: '$issue_id_team.name',
                    TYPE1: '$type',
                    TRADE: '$trade',
                    SUMMARY: '$summary',
                    STATUS: '$status',
                    DT_START: '$date.dt_start',
                    DT_END: '$date.dt_end',
                }
                break;
            case 'PIMS상담':
                project = {
                    _id: false,
                    NAME: '$issue_id_team.name',
                    MODULE: { $first: "$modules" },
                    SUMMARY: '$summary',
                    STATUS: '$status',
                    DT_START: '$date.dt_start',
                    DT_END: '$date.dt_end',
                    DT_DUE: '$date.dt_due',
                }
                break;
            case '견적':
                project = {
                    _id: false,
                    NAME: '$issue_id_team.name',
                    DEV_TYPE: '$dev_type',
                    SUMMARY: '$summary',
                    STATUS: '$status',
                    DT_START: '$date.dt_start',
                    DT_END: '$date.dt_end',
                    DT_DUE: '$date.dt_due',
                }
                break;
        }

        let seq = ''
        switch (group_fg) {
            case '단위업무':
                seq = '단위업무'
                break;
            case '연구개발(Amaranth10)':
            case '연구개발(패키지)':
            case '연구개발(전용개발)':
            case 'Bizbox Alpha':
                seq = '연구개발'
                break;
            case 'PIMS상담':
                seq = '상담'
                break;
            case '견적':
                seq = '견적'
                break;
        }

        let result = await Issue.aggregate([{
            $match: {
                type: { $nin: ['', null] },
                'date.dt_start': { $nin: ['', null] },
                status: _status,
                'id.id_assign': { $in: _id },
                group: seq,
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
            $project: project
        }])

        res.status(201).json(result)
    } catch (err) {
        util.err(err)
        next(err)
    }
})

module.exports = router