db.timedates.aggregate([{
    $match: {
        date: { $gte: _dt_start },
        date: { $lte: _dt_end },
        time: { $nin: ['', null, 0, '0'] }
    }
}, {
    $group: {
        _id: {
            category: {
                $switch: {
                    branches: [
                        { case: { $eq: [_lms_fg, 'M'] }, then: '$category.m' },
                        { case: { $eq: [_lms_fg, 'S'] }, then: '$category.s' },
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
}, { $sort: { cnt: -1 } }])