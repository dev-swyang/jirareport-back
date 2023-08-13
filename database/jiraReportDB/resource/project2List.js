db.issues.aggregate([{
    $match: {
        type: { $nin: ['', null] },
        'date.dt_start': { $nin: ['', null] },
        'id.id_assign': { $in: ['yswgood0329', 'testId'] },
        status: { $in: ['견적요청(PIMS)', '할일', '확인예정(PIMS)'] },
        group: '단위업무',
        $or: [
            {
                $and: [
                    { 'date.dt_end': { $gte: '20210101' } },
                    { 'date.dt_end': { $lte: '20211231' } }
                ]
            }, {
                $and: [
                    { 'date.dt_start': { $gte: '20210101' } },
                    { 'date.dt_start': { $lte: '20211231' } }
                ]
            }, {
                $and: [
                    { 'date.dt_start': { $gt: '20210101' } },
                    { 'date.dt_end': { $in: ['', null] } }
                ]
            }
        ],
    }
}])