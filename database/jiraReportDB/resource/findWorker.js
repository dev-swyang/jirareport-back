db.users.find({
    // 부서로 사원 찾기
    // team_name: {$nin: []}
    team_name: { $in: ['개발 1팀', '개발 2팀'] }

    // 아이디로 사원 찾기
    // id: {$nin: []}
    // id: {$in: ['yswgood0329' 'testId']}
}, {
    _id: false,
    id: true
})