db.issues.aggregate([{
    $match: {
        type: {$nin: ['', null]},
        'date.dt_start': { $nin: ['', null] },
        'id.id_assign': { $in: _id },
        status: {$in: ['견적요청(PIMS)', '할일', '확인예정(PIMS)']},
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
        team: '$issue_id_team.team_name',
        group: '$group',
        type: '$type',
        status: {$ifNull: ['$status', '']},
        summary: {$ifNull: ['$summary', '']},
        dt_due: {$ifNull: ['$date.dt_due', '']},
        dt_start: {$ifNull: ['$date.dt_start', '']},
        dt_end: {$ifNull: ['$date.dt_end', '']},
    }
}, {$unwind: '$team'}])