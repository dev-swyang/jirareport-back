db.issues.aggregate([{
    $match: {
        group: '연구개발',
        type: {$nin: ['', null]},
        'date.dt_start': { $nin: ['', null] },
        'date.dt_due': {$nin: ['', null]},
        status: {$nin: ['보류(Hold)','완료(Resolve)','수정불가(PIMS)','업데이트대기(PIMS)','업데이트완료(PIMS)','원격지원(PIMS)','장기수정(PIMS)','확인완료(PIMS)','견적보류(PIMS)','견적완료(PIMS)','업데이트완료(PIMS)','완료(Resolve)','최종테스트(PIMS)','2차테스트(PIMS)']},
        'id.id_assign': { $in: _id },
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
        ],
    }
}, {
    $group: {
        _id: '$type',
        cnt: {$sum: 1},
    }
}])