db.issues.aggregate([{
    $match: {
        'date.dt_start': { $nin: ['', null] },
        'id.id_assign': { $in: _id },
        $or: [
            { $eq: [{ $ifNull: ['$group', ''] }, '연구개발'], $ne: [{ $ifNull: ['$type', ''] }, ''] },
            { $eq: [{ $ifNull: ['$group', ''] }, '연구개발'] }
        ],
        $or: [
            {
                $and: [
                    { 'date.dt_end': { $gte: _dt_start } },
                    { 'date.dt_end': { $lte: _id_end } }
                ]
            }, {
                $and: [
                    { 'date.dt_start': { $gte: _dt_start } },
                    { 'date.dt_start': { $lte: _id_end } }
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
    $group: {
        _id: { group: '$group', type: '$type', status: '$status' },
        cnt: { $sum: 1 }
    }
}, {
    $project: {
        _id: false,
        status: '$_id.status',
        type: '$_id.type',
        group: '$_id.group',
        fg: {
            $switch: {
                branches: [
                    { case: { $in: ['$_id.status', ['견적요청(PIMS)', '할일', '확인예정(PIMS)']] }, then: '할일' },
                    { case: { $in: ['$_id.status', ['진행중(In Progress)', '확인중(PIMS)', '개발예정(PIMS)', '개발중(In Progress)', '설계중(In Progress)', '수정예정(PIMS)', '수정완료(PIMS)', '1차테스트(PIMS)', '2차테스트(PIMS)', '검토예정(PIMS)', '견적작성(PIMS)']] }, then: '진행중' },
                ],
                default: '완료'
            }
        },
        cnt: '$cnt'
    }
}, {
    $group: {
        _id: '$fg',
        'Amaranth10': {
            $sum: { $cond: [{ $eq: ['$type', 'Amaranth10'] }, '$cnt', 0] }
        },
        '프로젝트(iCUBE)': {
            $sum: { $cond: [{ $eq: ['$type', '프로젝트(iCUBE)'] }, '$cnt', 0] }
        },
        '패키지유지보수(iCUBE)': {
            $sum: { $cond: [{ $eq: ['$type', '패키지유지보수(iCUBE)'] }, '$cnt', 0] }
        },
        '전용개발(iCUBE)': {
            $sum: { $cond: [{ $eq: ['$type', '전용개발(iCUBE)'] }, '$cnt', 0] }
        },
        '전용개발유지보수(iCUBE)': {
            $sum: { $cond: [{ $eq: ['$type', '전용개발유지보수(iCUBE)'] }, '$cnt', 0] }
        },
        'BizBox Alpha': {
            $sum: { $cond: [{ $eq: ['$type', 'BizBox Alpha'] }, '$cnt', 0] }
        },
        '단위업무': {
            $sum: { $cond: [{ $eq: ['$group', '단위업무'] }, '$cnt', 0] }
        },
        '상담': {
            $sum: { $cond: [{ $eq: ['$group', '상담'] }, '$cnt', 0] }
        },
        '견적': {
            $sum: { $cond: [{ $eq: ['$group', '견적'] }, '$cnt', 0] }
        },
    }
}])