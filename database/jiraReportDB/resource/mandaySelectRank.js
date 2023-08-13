db.timedates.aggregate([{
    $match: {
        date: { $gte: _dt_start },
        date: { $lte: _dt_end },
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
}, { $sort: { cnt: -1 } }, { $limit: 3 }])