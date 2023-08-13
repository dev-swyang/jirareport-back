module.exports = {
    baseRouter: require('./base'),
    // 종합현황 - Tab1
    mainRouter: require('./main'),
    // 종합현황 - Tab2
    totalviewRouter: require('./totalview'),
    // 종합현황 - Tab3
    mandayRouter: require('./manday'),
    // 업무현황
    taskviewRouter: require('./taskview'),
    // 프로젝트현황
    projectRouter: require('./project'),
    // 투입공수
    costRouter: require('./cost'),
    // 일일업무보고
    dailyRouter: require('./daily')
}