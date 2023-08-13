db.issues.aggregate([{
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