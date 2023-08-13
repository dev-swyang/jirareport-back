const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const connect = require('./database/jiraReportDB')
const pimsToJira = require('./pimsToJira')

dotenv.config()

// router 호출부
const {
    baseRouter,
    // 종합현황 - Tab1
    mainRouter,
    // 종합현황 - Tab2
    totalviewRouter,
    // 종합현황 - Tab3
    mandayRouter,
    // 업무현황
    taskviewRouter,
    // 프로젝트현황
    projectRouter,
    // 투입공수
    costRouter,
    // 일일업무복고
    dailyRouter
} = require('./routes')

const app = express()
app.set('port', process.env.NODE_PORT || 3333)

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

/******* PIMSTOJIRA *******/
/** Jira - Pims 연동부 */
pimsToJira()


/******* jireReportDB(MongoDB) 연결부 *******/
connect()

/***** Router *****/
// Base Router
app.use('/', baseRouter)
// 종합현황 - Tab1
app.use('/main', mainRouter)
// 종합현황 - Tab2
app.use('/totalview', totalviewRouter)
// 종합현황 - Tab3
app.use('/manday', mandayRouter)
// 업무현황
app.use('/taskview', taskviewRouter)
// 프로젝트현황
app.use('/project2', projectRouter)
// 투입공수
app.use('/cost', costRouter)
// 일일업무보고
app.use('/daily', dailyRouter)


/******* Error *******/
app.use((err, req, res, next) => {
    let error = {
        message: err.message,
        error: err,
        status: err.status || 500
    }

    res.status(error.status).json(error)
})

app.listen(app.get('port'), () => {
    console.log(`${app.get('port')}번 포트에서 대기 중....`)
})