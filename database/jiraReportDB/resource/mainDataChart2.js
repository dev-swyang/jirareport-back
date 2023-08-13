db.issues.aggregate([{
    $match: {
        group: '연구개발',
        type: { $nin: ['', null] },
        'date.dt_start': { $nin: ['', null] },
        'status': { $nin: ['완료(Resolve)', '업데이트완료(PIMS)'] },
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
        _id: {
            status: '$status',
            type: '$type'
        },
        cnt: { $sum: 1 }
    }
}, {
    $group: {
        _id: '$_id.status',
        'Amaranth10': {
            $sum: { $cond: [{ $eq: ['$_id.type', 'Amaranth10'] }, '$cnt', 0] }
        },
        '프로젝트(iCUBE)': {
            $sum: { $cond: [{ $eq: ['$_id.type', '프로젝트(iCUBE)'] }, '$cnt', 0] }
        },
        '패키지유지보수(iCUBE)': {
            $sum: { $cond: [{ $eq: ['$_id.type', '패키지유지보수(iCUBE)'] }, '$cnt', 0] }
        },
        '전용개발(iCUBE)': {
            $sum: { $cond: [{ $eq: ['$_id.type', '전용개발(iCUBE)'] }, '$cnt', 0] }
        },
        '전용개발유지보수(iCUBE)': {
            $sum: { $cond: [{ $eq: ['$_id.type', '전용개발유지보수(iCUBE)'] }, '$cnt', 0] }
        },
    }
}])