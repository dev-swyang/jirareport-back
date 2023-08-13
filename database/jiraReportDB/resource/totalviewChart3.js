db.issues.aggregate([{
    $match: {
        group: { $nin: ['', null] },
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