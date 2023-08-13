db.issues.aggregate([{
    $match: {
        type: { $nin: ['', null] },
        'date.dt_start': { $nin: ['', null] },
        $or: [
            {
                $and: [
                    { 'date.dt_end': { $gte: _dt_start } },
                    { 'date.dt_end': { $lte: _dt_end } }
                ]
            }, {
                $and: [
                    { 'date.dt_start': { $gte: _dt_start } },
                    { 'date.dt_start': { $lte: _dt_end } }
                ]
            }, {
                $and: [
                    { 'date.dt_start': { $gt: _dt_start } },
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
}])