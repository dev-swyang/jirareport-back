const util = require('../../utils')
const Issue = require('../../database/jiraReportDB/issue')
const amaranthApi = require('../amaranth/amaranthApi')

/** Jira시스템 외부 연동 API */
/** Atlassian의 Jira시스템 연동을 위한 제공 Open API 연동 기능 */
const requestApi = {

    // 상담등록
    counsel: (pims) => {
        if ((pims.length || 0) === 0) return;

        try {
            pims.map(async (pi) => {
                let issues = await jiraApi.getIssuesByJql(`project = ERP2P1K1 and issuetype = 상담 and "PIMS 번호" ~ ${pi['PIMS번호']}`)

                if (issues.data.issues.length > 0) {
                    let issue = issues.data.issues[0]

                    if (pi['상태'] === "수정완료(PIMS)") {
                        if (!((pi['테스트상태'] || '') === '')) {
                            if (pi['테스트상태'].startsWith("1차-")) {
                                if (issue.Status.toString() === "1차테스트(PIMS)")
                                    return;
                                else
                                    pi['상태'] = "1차테스트(PIMS)";
                            }
                            else if (pi['테스트상태'].startsWith("2차-")) {
                                if (issue.Status.toString() === "2차테스트(PIMS)")
                                    return;
                                else
                                    pi['상태'] = "2차테스트(PIMS)";
                            }
                            else if (pi['테스트상태'].startsWith("최종-")) {
                                if (issue.Status.toString() == "최종테스트(PIMS)")
                                    return;
                                else
                                    pi['상태'] = "최종테스트(PIMS)";
                            }
                        }
                        else {
                            if (issue.Status.toString() === pi['상태'])
                                return;
                        }
                    }
                    else if (issue.Status.toString() === pi['상태']) {
                        return;
                    }
                } else {
                    let result = await jiraApi.addRequest(pi)
                    return;
                }

                let result = await jiraApi.updateRequest(issue.Key, pi) // ballboy 

                // 메세지 발송 // ballboy
                amaranthApi.sendMessage('PIMS', pi.Assignee, pi['PIMS번호'])

            })
        } catch (err) {
            util.err(err)
        }
    },

    // 프로젝트 등록
    project: (pims) => {
        if ((pims.length || 0) === 0) return;

        try {
            let result = null;
            pims.map(async (pi) => {
                let epics = await jiraApi.getIssuesByJql(`project = ERP2P1K1 and issuetype = Epic and "핌스프로젝트" = "${pi['프로젝트']}"`)

                if (epics.data.issues.length <= 0) {
                    result = await jiraApi.addProjectEpicRequest(pi)
                    return;
                }

                epics.data.issues.map((epic) => {
                    jiraApi.updateProjectEpicRequest(epic.key, pi)
                })
            })

        } catch (err) {
            util.err(err)
        }

    },

    // 연구개발등록
    rnd: (pims) => {
        if ((pims.length || 0) === 0) return;

        try {
            let result = null;
            pims.map(async (pi) => {
                let epics = await jiraApi.getIssuesByJql(`project = ERP2P1K1 and issuetype = Epic and "핌스프로젝트" = "${pi['프로젝트']}"`)

                if (epics.data.issues.length <= 0) {
                    result = await jiraApi.addProjectEpicRequest(pi)
                    return;
                }

                epics.data.issues.map((epic) => {
                    jiraApi.updateProjectEpicRequest(epic.key, pi)
                })
            })

        } catch (err) {
            util.err(err)
        }
    },

    // 고객유지보수
    maintenance: (pims) => {
        if ((pims.length || 0) === 0) return;

        try {
            let result = null; let epicIssue = null; let msg = { send: false, msgSender: '', msgReciver: '' };
            pims.map(async (pi) => {
                let epics = await jiraApi.getIssuesByJql(`project = ERP2P1K1 AND issuetype = Epic AND "핌스프로젝트" = "${pi['프로젝트']}"`)

                if (epics.data.issues.length > 0) {
                    epicIssue = epics.data.issues[0]
                    pi.EpicLink = epicIssue.Key.toString()
                } else return;

                if ((pi.EpicLink || '') === '') return;

                let issues = await jiraApi.getIssuesByJql(`project = ERP2P1K1 and issuetype = 연구개발 and "PIMS 번호" ~ ${pi['PIMS번호']}`)

                if (issues.data.issues.length > 0) {
                    let issue = issues.data.issues[0]

                    if ((pi['상태'] === '개발예정' || pi['수정예정']) && pi['개발진행등록'] === 'N' && ((pi['분석일'] || '') === '')) {
                        pi['상태'] = '할일'
                        pi.Assignee = pi['설계자']

                    } else if ((pi['상태'] === '개발예정' || pi['상태'] === '수정예정' || pi['상태'] === '설계완료') && pi['개발진행등록'] === 'N' && !((pi['분석일'] || '') === '')) {
                        pi['상태'] === '설계중(IN PROGRESS)'
                        pi.Assignee === pi['설계자']

                    } else if ((pi['상태'] === '개발예정' || pi['상태'] === '수정예정' || pi['상태'] === '설계완료') && pi['개발진행등록'] === 'Y' && ((pi['개발시작일'] || '') === '')) {
                        pi['상태'] === '개발예정(PIMS)'
                        pi.Assignee = pi['개발자']

                        msg = {
                            send: true,
                            msgSender: pi['설계자'],
                            msgReciver: pi['개발자']
                        }

                    } else if ((pi['상태'] === '개발예정' || pi['상태'] === '수정예정' || pi['상태'] === '설계완료') && pi['개발진행등록'] === 'Y' && !((pi['개발시작일'] || '') === '')) {
                        pi['상태'] === '개발중(IN PROGRESS)'
                        pi.Assignee = pi['개발자']

                    } else if (pi['상태'] === '수정완료' && (['미완료', '대기', '진행중(오류)', '진행중(수정)', '진행중(재확인)'].findIndex((v) => { return v === pi['이차테스트상태'] }) > -1)) {
                        pi['상태'] = '2차테스트(PIMS)'
                        pi.Assignee = (pi['이차테스트상태'] === '진행중(오류)') ? pi['개발자'] : pi['이차테스트담당자']

                        msg = {
                            send: true,
                            msgSender: pi['이차테스트상태'] === '진행중(오류)' ? pi['이차테스트담당자'] : pi['개발자'],
                            msgReciver: pi['이차테스트상태'] === '진행중(오류)' ? pi['개발자'] : pi['이차테스트담당자']
                        }

                    } else if (pi['상태'] === '수정완료' && pi['이차테스트상태'] === '완료' && (['미완료', '대기', '진행중(오류)', '진행중(수정)', '진행중(재확인)'].findIndex((v) => { return v === pi['삼차테스트상태'] }) > -1)) {
                        pi['상태'] = '최종테스트(PIMS)'
                        pi.Assignee = (pi['삼차테스트상태'] === '진행중(오류)') ? pi['개발자'] : pi['최종테스트담당자']

                        if (!((pi['최종테스트담당자'] || '') === '')) {
                            msg = {
                                send: true,
                                msgSender: ((pi['삼차테스트상태'] === '미완료' || pi['삼차테스트상태'] === '대기') ? pi['이차테스트담당자'] : ((pi['삼차테스트상태'] === '진행중(오류)') ? pi['최종테스트담당자'] : pi['개발자'])), // ballboy
                                msgReciver: pi['삼차테스트상태'] === '진행중(오류)' ? pi['개발자'] : pi['최종테스트담당자']
                            }
                        }

                    } else if (pi['상태'] === '수정완료' && pi['삼차테스트상태'] === '완료') {
                        pi['상태'] = '완료(RESOLVE)'
                        pi.Assignee = pi['설계자']

                    } else if (pi['상태'] === '업데이트완료' || pi['상태'] === '업데이트대기') {
                        pi['상태'] = '업데이트완료(PIMS)'
                        pi.Assignee = pi['설계자']

                    } else {
                        pi['상태'] = '할일'
                        pi.Assignee = pi['설계자']
                    }

                    if ((['최종테스트(PIMS)', '완료(RESOLVE)', '업데이트완료(PIMS)'].findIndex((v) => { return v === pi['상태'] }) > -1 && !((pi['최종테스트담당자'] || '') === ''))) { }
                    else if (pi['상태'] === '2차테스트(PIMS)' || pi['상태'] === '최종테스트(PIMS)' && issue.Assignee !== pi.Assignee && !((pi.Assignee || '') === '')) { }
                    else {
                        if (issue.Status === '보류(HOLD)' || issue.Status === pi['상태']) return
                    }
                } else {
                    jiraApi.addDevPlanRequest(pi)
                    return;
                }

                jiraApi.updateDevPlanRequest(key, pi)

                // 메세지 발송 // ballboy
                amaranthApi.sendMessage('PIMS', pi.Assignee, pi['PIMS번호'])
            })

        } catch (err) {
            util.err(err)
        }
    },

    // 견적등록
    estimate: (pims) => {
        if ((pims.length || 0) === 0) return;

        try {
            let result = null;
            pims.map(async (pi) => {
                let issues = await jiraApi.getIssuesByJql(`project = ERP2P1K1 and issuetype = 견적 and "견적번호" ~ ${pi['견적번호']}`)

                if (issues.data.issues.length > 0) {
                    if (issues.data.issues[0].Status === pi['상태']) return;
                    else {
                        let issue = issues.data.issues[0]
                        result = await jiraApi.updateOrder(issue.Key, pi)
                    }
                } else {
                    result = await jiraApi.addOrder(pi)
                }

                amaranthApi.sendMessage('PIMS', pi.Assignee, pi['PIMS번호'])
            })


        } catch (err) {
            util.err(err)
        }
    },

    // 리포트 서버 연동
    reportServerInterlock: () => {
        const jqls = {
            ISSUE: `project='ERP2P1K1' and issuetype in ('연구개발', '견적', '단위업무', '상담') and ( created >= '${util.baseDate.todayBar}' or updated >= '${util.baseDate.todayBar}' ) order by createdDate DESC`,
            EPIC: `project='ERP2P1K1' and issuetype = 'epic' and ( created >= '${util.baseDate.todayBar}' or updated >= '${util.baseDate.todayBar}' ) order by createdDate DESC`,
            // EBP 프로젝트
            UCAIMP_DEV: `project = UCAIMP AND issuetype = 개선 AND cf[10825] in ("인사/근태", "회계(비영리)", "회계(영리)", "스마트자금관리") and 개발담당자 in membersOf("ERP제2연구센터") and ( created >= '${util.baseDate.todayBar}' or updated >= '${util.baseDate.todayBar}' ) order by createdDate DESC`,
            UCAIMP_PLN: `project = UCAIMP AND issuetype = sub-설계 AND cf[10825] in ("인사/근태", "회계(비영리)", "회계(영리)", "스마트자금관리") and assignee in membersOf("ERP제2연구센터") and ( created >= '${util.baseDate.todayBar}' or updated >= '${util.baseDate.todayBar}' ) order by createdDate DESC`,
            UBA_DEV: `project in (UBA, UAC) AND issuetype != 개선 AND cf[10825] in ("인사/근태", "회계(비영리)", "회계(영리)", "스마트자금관리") AND assignee in membersOf("ERP제2연구센터") and ( created >= '${util.baseDate.todayBar}' or updated >= '${util.baseDate.todayBar}' ) order by createdDate DESC`,
            UBA_PLN: `project in (UBA, UAC) AND issuetype = 개선 AND cf[10825] in ("인사/근태", "회계(비영리)", "회계(영리)", "스마트자금관리") AND assignee in (membersOf(ERP제2연구센터)) and ( created >= '${util.baseDate.todayBar}' or updated >= '${util.baseDate.todayBar}' ) order by createdDate DESC`,
            // 아마란스 공통 프로젝트
            KLAGONEW: `project = 'EKLAGONEW' AND assignee in (membersOf(ERP제2연구센터)) and ( created >= '${util.baseDate.todayBar}' or updated >= '${util.baseDate.todayBar}' ) order by createdDate DESC`,
        }

        Object.keys(jqls).map(async (key) => {

            let maxResult = 100;
            let startAt = 0;

            while (true) {
                let issues = await jiraApi.getIssuesByJql(jqls[key])

                if (issues.data.issues.length === 0) break;

                issues = issues.data.issues

                issues.map(async (issue) => {
                    if ((issue.Labels || '') !== '' && issue.Labels.indexOf('이관') > -1) {
                        await jiraApi.deleteServer(issue.Key)
                    } else {
                        await jiraApi.updateServer(issue)
                    }
                })

                startAt += maxResult;
            }
        })
    }
}

const jiraApi = {
    // Search for issues using JQL (GET)
    /** jira시스템 JQL 사용 데이터 조회 API */
    getIssuesByJql: (jql, maxResult, startAt) => {
        return new Promise((resolve, reject) => {
            util.callApi.get(
                /***** URL *****/
                `${process.env.JIRA_URL}/rest/api/3/search`,
                /***** header *****/
                {
                    'Accept': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_ID}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`
                },
                /***** params *****/
                {
                    'jql': jql,
                    'maxResults': maxResult || 100,
                    'startAt': startAt || 0
                }
            ).then((res) => {
                resolve(res.text())
            }).catch((err) => {
                reject(err)
            })
        })
    },
    // Create issue
    /** Jira 시스템 Issue card 생성 API */
    addRequest: (pi) => {
        let addData = {
            fields: {
                type: '상담',
                Summary: pi.Summary,
                Components: [
                    pi.Components
                ],
                Description: pi['설명'],
                Assignee: pi.Assignee,
                Reporter: pi.Reporter,
                // Epic Link
                customfield_10001: 'ERP2PiK1-5758',
                // PIMS번호
                customfield_11102: pi['PIMS번호'],
                // 업무구분
                customfield_10807: '상담',
                // 요청일자
                customfield_10820: pi['요청일자'],
                // 상담요청자
                customfield_11003: pi['상담요청자'],
                // 상담접수자
                customfield_11004: pi['상담접수자'],
                // 제품
                customfield_10983: pi['제품'],
                // 개발구분
                customfield_10987: pi['개발코드'],
                // 모듈(PIMS)
                customfield_10988: pi['모듈Pims'],
                // 파일코드
                customfield_10989: pi['파일코드'],
                // 파일명
                customfield_11000: pi['파일명'],
                // 고객
                customfield_10811: pi['고객'],
                // 긴급도
                customfield_10991: pi['긴급도'],
                // 처리일자
                customfield_10992: pi['처리일자'],
                // 웹콜상태
                customfield_10996: pi['웹콜상태'],
                // 테스트상태
                customfield_10993: pi['테스트상태'],
                // 요청부서
                customfield_10977: [
                    pi['요청부서'].spilt('|').filter((v) => { return (v || '') !== '' })
                ],
                // 처리구분
                customfield_10982: [
                    pi['처리구분'].spilt('|').filter((v) => { return (v || '') !== '' })
                ]
            }
        }

        return new Promise((resolve, reject) => {
            util.callApi.post(
                `${process.env.JIRA_URL}/rest/api/3/issue`,
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_ID}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`
                },
                {
                    body: addData
                }
            ).then((res) => {
                resolve(res.text())
            }).catch((err) => {
                reject(err)
            })
        })
    },
    /** Jira 시스템 Issue card 업데이트 API */
    updateRequest: (key, pi) => {
        let updateData = {
            fields: {
                type: '상담',
                Summary: pi.Summary,
                Components: [
                    pi.Components
                ],
                Description: pi['설명'],
                Assignee: pi.Assignee,
                Reporter: pi.Reporter,
                // Epic Link
                customfield_10001: 'ERP2PiK1-5758',
                // PIMS번호
                customfield_11102: pi['PIMS번호'],
                // 업무구분
                customfield_10807: '상담',
                // 요청일자
                customfield_10820: pi['요청일자'],
                // 상담요청자
                customfield_11003: pi['상담요청자'],
                // 상담접수자
                customfield_11004: pi['상담접수자'],
                // 제품
                customfield_10983: pi['제품'],
                // 개발구분
                customfield_10987: pi['개발코드'],
                // 모듈(PIMS)
                customfield_10988: pi['모듈Pims'],
                // 파일코드
                customfield_10989: pi['파일코드'],
                // 파일명
                customfield_11000: pi['파일명'],
                // 고객
                customfield_10811: pi['고객'],
                // 긴급도
                customfield_10991: pi['긴급도'],
                // 처리일자
                customfield_10992: pi['처리일자'],
                // 웹콜상태
                customfield_10996: pi['웹콜상태'],
                // 테스트상태
                customfield_10993: pi['테스트상태'],
                // 요청부서
                customfield_10977: [
                    pi['요청부서'].spilt('|').filter((v) => { return (v || '') !== '' })
                ],
                // 처리구분
                customfield_10982: [
                    pi['처리구분'].spilt('|').filter((v) => { return (v || '') !== '' })
                ]
            }
        }

        return new Promise((resolve, reject) => {
            util.callApi.put(
                `${process.env.JIRA_URL}/rest/api/3/issue/${key}`,
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_ID}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`
                },
                {
                    body: updateData
                }
            ).then((res) => {
                resolve(res.text())
            }).catch((err) => {
                reject(err)
            })
        })
    },
    /** Jira 시스템 Project Epic Card 생성 API */
    addProjectEpicRequest: (pi) => {
        let addData = {
            Type: '10000',
            Summary: pi.Summary,
            Components: [
                pi.Components
            ],
            Assignee: pi.Assignee,
            Reporter: pi.Reporter,
            Description: pi['설명'],
            customfield_11134: pi['프로젝트유형'],
            // 업무구분
            customfield_10807: pi['업무구분'],
            // 프로젝트구분
            customfield_10812: pi['프로젝트구분'],
            // 제품
            customfield_10983: pi['제품'],
            // 모듈(PIMS)
            customfield_10988: pi['모듈Pims'],
            // 개발유형
            customfield_11107: [
                pi['개발유형'].split('|').filter((v) => { return (v || '') !== '' })
            ],
            // 연동시스템
            customfield_11108: [
                pi['연동시스템'].split('|').filter((v) => { return (v || '') !== '' })
            ],
            // 고객
            customfield_10811: pi['고객'],
            // 핌스프로젝트
            customfield_11146: pi['프로젝트'],
            // 발주일자
            customfield_10818: pi['발주일자'],
            // 접수일자
            customfield_10817: pi['접수일자'],
            // 가격
            customfield_10801: pi['가격'],
            // 난이도
            customfield_11032: pi['난이도'],
        }
        // 기한
        addData = ((pi['기한'] || '') !== '') ? { ...addData, DueDate: pi['기한'] } : { ...addData }

        return new Promise((resolve, reject) => {
            util.callApi.post(
                `${process.env.JIRA_URL}/rest/api/3/issue`,
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_ID}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`
                },
                {
                    body: addData
                }
            ).then((res) => {
                resolve(res.text())
            }).catch((err) => {
                reject(err)
            })
        })
    },
    /** Jira 시스템 Project Epic Card 업데이트 API */
    updateProjectEpicRequest: (key, pi) => {
        let updateData = {
            Summary: pi.Summary,
            Components: [
                pi.Components
            ],
            Assignee: pi.Assignee,
            Reporter: pi.Reporter,
            Description: pi['설명'],
            customfield_11134: pi['프로젝트유형'],
            // 업무구분
            customfield_10807: pi['업무구분'],
            // 프로젝트구분
            customfield_10812: pi['프로젝트구분'],
            // 제품
            customfield_10983: pi['제품'],
            // 모듈(PIMS)
            customfield_10988: pi['모듈Pims'],
            // 개발유형
            customfield_11107: [
                pi['개발유형'].split('|').filter((v) => { return (v || '') !== '' })
            ],
            // 연동시스템
            customfield_11108: [
                pi['연동시스템'].split('|').filter((v) => { return (v || '') !== '' })
            ],
            // 고객
            customfield_10811: pi['고객'],
            // 핌스프로젝트
            customfield_11146: pi['프로젝트'],
            // 발주일자
            customfield_10818: pi['발주일자'],
            // 접수일자
            customfield_10817: pi['접수일자'],
            // 가격
            customfield_10801: pi['가격'],
            // 난이도
            customfield_11032: pi['난이도'],
        }
        // 기한
        updateData = ((pi['기한'] || '') !== '') ? { ...addData, DueDate: pi['기한'] } : { ...addData }

        return new Promise((resolve, reject) => {
            util.callApi.put(
                `${process.env.JIRA_URL}/rest/api/3/issue/${key}`,
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_ID}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`
                },
                {
                    body: updateData
                }
            ).then((res) => {
                resolve(res.text())
            }).catch((err) => {
                reject(err)
            })
        })
    },

    addPrevIssue: (pi) => {
        let addData = {
            Type: '단위업무',
            Summary: pi.Summary,
            Components: [
                pi.Components
            ],
            Description: pi.Description,
            Assignee: pi.Assignee,
            Reporter: pi.Reporter,
            // Epic Link
            customfield_10005: 'ERP2P1K1-61689',
            // 업무구분
            customfield_10807: '단위업무',
            // 단위업무구분
            customfield_10809: '상담',
        }

        return new Promise((resolve, reject) => {
            util.callApi.post(
                `${process.env.JIRA_URL}/rest/api/3/issue`,
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_ID}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`
                },
                {
                    body: addData
                }
            ).then((res) => {
                resolve(res.text())
            }).catch((err) => {
                reject(err)
            })
        })
    },
    updatePrevIssue: (key, pi) => {

        let updateData = {
            Summary: pi.Summary,
            Components: [
                pi.Components
            ],
            Description: pi.Description,
            Assignee: pi.Assignee,
            Reporter: pi.Reporter
        }

        return new Promise((resolve, reject) => {
            util.callApi.put(
                `${process.env.JIRA_URL}/rest/api/3/issue/${key}`,
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_ID}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`
                },
                {
                    body: updateData
                }
            ).then((res) => {
                resolve(res.text())
            }).catch((err) => {
                reject(err)
            })
        })
    },
    addOrder: (pi) => {
        let addData = {
            Type: '견적',
            Summary: pi.Summary,
            Components: [
                pi.Components
            ],
            Description: pi['설명'],
            Assignee: pi.Assignee,
            Reporter: pi.Reporter,
            // Epic Link
            customfield_10001: 'ERP2PiK1-5758',
            // 견적번호
            customfield_10976: pi['견적번호'],
            // 업무구분
            customfield_10807: '견적',
            // 고객담당자
            customfield_10873: pi['고객담당자'],
            // 전화번호
            customfield_10871: pi['전화번호'],
            // 요청자
            customfield_10947: pi['요청자'],
            // 견적요청일
            customfield_10975: pi['견적요청일'],
            // 견적접수일
            customfield_10997: pi['견적접수일'],
            // 견적작성일
            customfield_10979: pi['견적작성일'],
            // 만족도
            customfield_10994: pi['만족도'],
            // 제품
            customfield_10983: pi['제품'],
            // 고객
            customfield_10811: pi['고객'],
            // 모듈(PIMS)
            customfield_10988: pi['모듈Pims'],
            // 설계자비고
            customfield_10978: pi['설계자비고'],
            // 견적완료일
            customfield_10980: pi['견적완료일'],
            // 견적금액
            customfield_10981: pi['견적금액'],
            // 개발유형
            customfield_11107: [
                pi['개발유형'].split('|').filter((v) => { return (v || '') !== '' })
            ],
            // 연동시스템
            customfield_11108: [
                pi['연동시스템'].split('|').filter((v) => { return (v || '') !== '' })
            ],
        }

        return new Promise((resolve, reject) => {
            util.callApi.post(
                `${process.env.JIRA_URL}/rest/api/3/issue`,
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_ID}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`
                },
                {
                    body: addData
                }
            ).then((res) => {
                resolve(res.text())
            }).catch((err) => {
                reject(err)
            })
        })
    },
    updateOrder: (key, pi) => {
        let updateData = {
            Summary: pi.Summary,
            Components: [
                pi.Components
            ],
            Description: pi['설명'],
            Reporter: pi.Reporter,
            // 요청부서
            customfield_10977: [
                pi['요청부서'].spilt('|').filter((v) => { return (v || '') !== '' })
            ],
            // 요청자
            customfield_10947: pi['요청자'],
            // 고객담당자
            customfield_10873: pi['고객담당자'],
            // 전화번호
            customfield_10871: pi['전화번호'],
            // 견적요청일
            customfield_10975: pi['견적요청일'],
            // 견적접수일
            customfield_10997: pi['견적접수일'],
            // 견적작성일
            customfield_10979: pi['견적작성일'],
            // 만족도
            customfield_10994: pi['만족도'],
            // 제품
            customfield_10983: pi['제품'],
            // 고객
            customfield_10811: pi['고객'],
            // 모듈(PIMS)
            customfield_10988: pi['모듈Pims'],
            // 설계자비고
            customfield_10978: pi['설계자비고'],
            // 견적완료일
            customfield_10980: pi['견적완료일'],
            // 개발유형
            customfield_11107: [
                pi['개발유형'].split('|').filter((v) => { return (v || '') !== '' })
            ],
            // 연동시스템
            customfield_11108: [
                pi['연동시스템'].split('|').filter((v) => { return (v || '') !== '' })
            ],
        }

        return new Promise((resolve, reject) => {
            util.callApi.put(
                `${process.env.JIRA_URL}/rest/api/3/issue/${key}`,
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_ID}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`
                },
                {
                    body: updateData
                }
            ).then((res) => {
                resolve(res.text())
            }).catch((err) => {
                reject(err)
            })
        })
    },
    addDevPlanRequest: (pi) => {
        let addData = {
            Type: '연구개발',
            Summary: pi.Summary,
            Components: [
                pi.Components
            ],
            Assignee: pi.Assignee,
            Reporter: pi.Reporter,
            Description: pi['설명'],
            // 프로젝트유형
            customfield_11134: pi['프로젝트유형'],
            // 업무구분
            customfield_10807: pi['업무구분'],
            // 프로젝트구분
            customfield_10812: pi['프로젝트구분'],
            // EpicLink
            customfield_10005: pi['EpicLink'],
            // 핌스프로젝트
            customfield_11146: pi['프로젝트'],
            // PIMS번호
            customfield_11102: pi['PIMS번호'],
            // 요청일자
            customfield_10820: pi['요청일자'],
            // 제품
            customfield_10983: pi['제품'],
            // 개발구분
            customfield_10987: pi['개발구분'],
            // 모듈(PIMS)
            customfield_10988: pi['모듈Pims'],
            // 파일코드
            customfield_10989: pi['파일코드'],
            // 파일명
            customfield_11000: pi['파일명'],
            // 고객
            customfield_10811: pi['고객'],
            // 설계자
            customfield_10938: pi['설계자'],
            // 개발자
            customfield_10805: pi['개발자'],
            // 2차테스트담당자
            customfield_11132: pi['이차테스트담당자'],
            // 최종테스트담당자
            customfield_11133: pi['최종테스트담당자'],
            // 분석일
            customfield_11129: pi['분석일'],
            // 설계시작일
            customfield_11130: pi['설계시작일'],
            // 설계완료일
            customfield_11131: pi['설계완료일'],
            // 개발요청일
            customfield_11127: pi['개발요청일'],
            // 개발완료요청일
            customfield_11128: pi['개발완료요청일'],
            // 개발시작일자
            customfield_11606: pi['개발시작일'],
            // 개발완료예정일
            customfield_11126: pi['개발완료예정일'],
            // 개발완료일자
            customfield_11116: pi['개발완료일자'],
            // 업데이트일자
            customfield_11117: pi['업데이트일자'],
            // 테스트상태
            customfield_10993: pi['테스트상태'],
            // 설계자비고
            customfield_10978: pi['설계자비고'],
            // 개발자비고
            customfield_11118: pi['개발자비고'],

            // 처리구분
            customfield_10982: [
                pi['처리구분'].spilt('|').filter((v) => { return (v || '') !== '' })
            ]
        }
        addData = ((pi['납기요청일'] || '') !== '') ? { ...addData, DueDate: pi['납기요청일'] } : { ...addData }

        return new Promise((resolve, reject) => {
            util.callApi.post(
                `${process.env.JIRA_URL}/rest/api/3/issue`,
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_ID}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`
                },
                {
                    body: addData
                }
            ).then((res) => {
                resolve(res.text())
            }).catch((err) => {
                reject(err)
            })
        })

    },
    updateDevPlanRequest: (key, pi) => {
        let updateData = {

            Summary: pi.Summary,
            Components: [
                pi.Components
            ],
            Assignee: pi.Assignee,
            Reporter: pi.Reporter,
            Description: pi['설명'],
            // 프로젝트유형
            customfield_11134: pi['프로젝트유형'],
            // 업무구분
            customfield_10807: pi['업무구분'],
            // 프로젝트구분
            customfield_10812: pi['프로젝트구분'],
            // 프로젝트
            customfield_11146: pi['프로젝트'],
            // PIMS번호
            customfield_11102: pi['PIMS번호'],
            // 요청일자
            customfield_10820: pi['요청일자'],
            // 제품
            customfield_10983: pi['제품'],
            // 개발구분
            customfield_10987: pi['개발구분'],
            // 모듈Pims
            customfield_10988: pi['모듈Pims'],
            // 파일코드
            customfield_10989: pi['파일코드'],
            // 파일명
            customfield_11000: pi['파일명'],
            // 고객
            customfield_10811: pi['고객'],
            // 설계자
            customfield_10938: pi['설계자'],
            // 개발자
            customfield_10805: pi['개발자'],
            // 이차테스트담당자
            customfield_11132: pi['이차테스트담당자'],
            // 최종테스트담당자
            customfield_11133: pi['최종테스트담당자'],
            // 분석일
            customfield_11129: pi['분석일'],
            // 설계시작일
            customfield_11130: pi['설계시작일'],
            // 설계완료일
            customfield_11131: pi['설계완료일'],
            // 개발요청일
            customfield_11127: pi['개발요청일'],
            // 개발완료일자
            customfield_11128: (pi['개발완료일자'] || '') === '' ? pi['개발완료요청일'] : pi['개발완료일자'],
            // 개발시작일
            customfield_11606: pi['개발시작일'],
            // 개발완료예정일
            customfield_11126: pi['개발완료예정일'],
            // 개발완료일자
            customfield_11116: pi['개발완료일자'],
            // 업데이트일자
            customfield_11117: pi['업데이트일자'],
            // 테스트상태
            customfield_10993: pi['테스트상태'],
            // 설계자비고
            customfield_10978: pi['설계자비고'],
            // 개발자비고
            customfield_11118: pi['개발자비고'],
            // 처리구분
            customfield_10982: [
                pi['처리구분'].spilt('|').filter((v) => { return (v || '') !== '' })
            ]
        }

        updateData = ((pi['납기요청일'] || '') !== '') ? { ...updateData, DueDate: pi['납기요청일'] } : { ...updateData }

        return new Promise((resolve, reject) => {
            util.callApi.put(
                `${process.env.JIRA_URL}/rest/api/3/issue/${key}`,
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_ID}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`
                },
                {
                    body: updateData
                }
            ).then((res) => {
                resolve(res.text())
            }).catch((err) => {
                reject(err)
            })
        })
    },
    deleteServer: async (key) => {
        try {
            await Issue.remove({ key: key })
        } catch (err) {
            util.err(err)
        }
    },
    updateServer: async (issue) => {
        try {
            await Issue.create({
                "key": issue.KEY,
                "link": `http://jira.ballboy.com:8080/browse/${issue.KEY}`,
                "group": issue.GROUP,
                "project": issue.PROJECT,
                "product": issue.PRODUCT,
                "modules": (issue.MODULES || '').split('|').filter((v2) => { return (v2 || '') !== '' }),
                "summary": issue.SUMMARY,
                "types": ([issue.TYPE1, issue.TYPE2] || '').filter((v2) => { return (v2 || '') !== '' }),
                "epic": {
                    "link": issue.EPIC_LINK,
                    "name": issue.EPIC_NAME
                },
                "id": {
                    "assign": issue.ID_ASSIGN,
                    "dev": issue.ID_DEV,
                    "plan": issue.ID_PLAN,
                    "attends": (issue.ID_ATTENDS || '').split('|').filter((v2) => { return (v2 || '') !== '' })
                },
                "status": issue.STATUS,
                "schedule": {
                    "dueDt": issue.DT_DUE,
                    "startDt": issue.DT_START,
                    "endDt": issue.DT_END,
                    "planStartDt": issue.DT_PLN_START,
                    "planEndDt": issue.DT_PLN_END,
                    "devStartDt": issue.DT_DEV_START,
                    "devEndDt": issue.DT_DEV_END
                },
                "updateDt": issue.UPDATE_DATE,
                "updateIp": issue.UPDATE_IP
            })
        } catch (err) {
            util.err(err)
        }
    },
}

module.exports = requestApi