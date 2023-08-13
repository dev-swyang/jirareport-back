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
    $group: {
        _id: '$group',
        cnt: { $sum: 1 }
    }
}])