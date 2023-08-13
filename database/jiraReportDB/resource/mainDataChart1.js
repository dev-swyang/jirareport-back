db.issues.aggregate([{
    $match: {
        group: _group,
        type: { $nin: ['', null, '프로젝트(D-ERP)', '단위업무'] },
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
    $project: {
        type: {
            $switch: {
                branches: [
                    { case: { $eq: [_group, '견적'] }, then: '$modules' },
                    { case: { $and: [{ $eq: [_group, '상담'] }, { $ne: ['$product', ''] }, { $ne: ['$product', null] }] }, then: '$product' },
                ],
                default: '$type'
            }
        }
    }
}, {
    $group: {
        _id: '$type',
        count: { $sum: 1 }
    }
}])