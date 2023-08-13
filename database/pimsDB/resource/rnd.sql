SELECT P.DEVPLAN_NO,
        P.PROJECT_CD,
	    P.PROJECT_FG,                           
        PT.PROJECT_NM,
	    F.MOD_CD,
        CASE WHEN(F.PROD_FG = 'G1') THEN GM.MGM_NM ELSE M2.MGM_NM END MOD_NM,
        CASE WHEN P.PROJECT_FG IN('PA', 'P9') THEN '전용개발' ELSE '패키지' END DEVMGM_FG_NM,
        M3.MGM_NM        DEV_FG_NM,
	    CASE WHEN P.PROJECT_FG IN('P1', 'P9') THEN '프로젝트' ELSE '유지보수' END PROJECT_FG_NM,                          
        P.DEMAND_DT,
        P.DEMAND_CD,
        E1.EMP_NM        DEMAND_NM,
        DP.DEPT_NM2      DEMAND_COM_NM,
        P.DEMAND_MGM_CD,
        M5.MGM_NM        DEMAND_MGM_NM,
        P.HAND_MGM_CD,
        P.PROD_FG,
        M1.MGM_NM        PROD_FG_NM,
        P.FILE_CD,  
        CASE WHEN P.FILE_CD = '예외' AND ISNULL(P.FILE_DC,'')<>'' THEN P.FILE_DC ELSE F.FILE_NM END FILE_NM_DC,
        P.FILE_DC,
        F.FILE_NM,
        P.PROJECT_FG,
        P.PROJECT_CD,
        PT.PROJECT_NM,  
	    PT.REMARK_DC,
        P.CUST_ID,
        T.CUST_NM,
        P.PLAN_CD,
        E2.EMP_NM        PLAN_NM,
        E3.EMP_NM        CON_EMP_NM,
        P.FIX_CD,
        E4.EMP_NM        FIX_NM,
        P.ASSAY_DT,
        P.DEVPLAN_DT,
        P.PLANST_DT,
        P.PLANED_DT,
        P.CONSULT_PLAN_END_DT,
        P.DELIVER_DT,
        P.PLANED_DT,
	    D.EDPLAN_DT,
        D.ENDDEMAIND_DT,
        D.DEVEL_DT,
        D.UPGRADE_DT,
        P.DEMAND_DC,
        P.ADD_DC,
        D.DEVEL_NO,
        CASE WHEN D.DEVEL_NO IS NULL THEN 'N' ELSE 'Y' END DEVEL_YN,                           
        D.DELAY_DC,
        D.TEST_DC,
	    D.ASK_DC,
        P.CONSULT_MGM_CD,
        M4.MGM_NM            CONSULT_MGM_NM,
	    CASE WHEN ISNULL(D.DEVEL_CD,'') <> '' THEN D.DEVEL_CD ELSE F.DEVEL_CD END DEVEL_CD,
	    D.DEVDEMAIND_DT,
        D.UPGRADE_DT,
        D.TEST1_CD,
	    CASE WHEN ISNULL(D.TEST2_CD,'') <> '' THEN D.TEST2_CD ELSE P.PLAN_CD END TEST2_CD,						
	    D.TEST_CD,
	    TE.TEST_EMP_CD,
        M7.MGM_NM           TEST2_FG_NM,
	    M8.MGM_NM           TEST_FG_NM,                          
		CASE WHEN ISNULL(D.TEST_FG,'01') <> '01' THEN '최종-'+M8.MGM_NM
		    WHEN ISNULL(D.TEST2_FG,'01') <> '01' THEN '2차-'+M7.MGM_NM
			WHEN ISNULL(D.TEST1_FG,'01') <> '01' THEN '1차-'+M6.MGM_NM
			ELSE NULL END TEST_STATUS,
        TE.TESTER_DC,
        M9.MGM_NM HAND_MGM_NM,
        PT.MOD_CD AS PT_MOD_CD,
        D.JIRA_DEVEL_START_DT
    FROM DEVPLAN P
        LEFT OUTER JOIN DEVMGM_D     F ON F.PROD_FG = P.PROD_FG AND F.DEVMGM_FG = P.DEVMGM_FG AND F.FILE_CD = P.FILE_CD
        LEFT OUTER JOIN DEVEL        D ON D.DEVPLAN_NO = P.DEVPLAN_NO AND ( D.CLONE_FG = '00' OR ( D.CLONE_FG = '02' AND D.REL_PROD_FG = 'Q1') )
        LEFT OUTER JOIN DCTRL_MGM_D M1 ON M1.CTRL_CD = 'GT' AND M1.MGM_CD = P.PROD_FG
        LEFT OUTER JOIN DCTRL_MGM_D M2 ON M2.CTRL_CD = 'MD' AND M2.MGM_CD = F.MOD_CD
        LEFT OUTER JOIN DCTRL_MGM_D M3 ON M3.CTRL_CD = 'DF' AND M3.MGM_CD = P.DEVMGM_FG
        LEFT OUTER JOIN DCTRL_MGM_D M4 ON M4.CTRL_CD = 'CU' AND M4.MGM_CD = P.CONSULT_MGM_CD
        LEFT OUTER JOIN DCTRL_MGM_D M5 ON M5.CTRL_CD = 'MT' AND M5.MGM_CD = P.DEMAND_MGM_CD
		LEFT OUTER JOIN DCTRL_MGM_D M6 ON M6.CTRL_CD = 'TG' AND M6.MGM_CD = D.TEST1_FG
		LEFT OUTER JOIN DCTRL_MGM_D M7 ON M7.CTRL_CD = 'TG' AND M7.MGM_CD = D.TEST2_FG
		LEFT OUTER JOIN DCTRL_MGM_D M8 ON M8.CTRL_CD = 'TG' AND M8.MGM_CD = D.TEST_FG
        LEFT OUTER JOIN DCTRL_MGM_D M9 ON M9.CTRL_CD = 'CT' AND M9.MGM_CD = P.HAND_MGM_CD
        LEFT OUTER JOIN DCTRL_MGM_D GM ON GM.CTRL_CD = 'GM' AND GM.MGM_CD = F.MOD_CD
        LEFT OUTER JOIN SEMP        E1 ON E1.EMP_CD = P.DEMAND_CD
        LEFT OUTER JOIN SEMP        E2 ON E2.EMP_CD = P.PLAN_CD
        LEFT OUTER JOIN SEMP        E3 ON E3.EMP_CD = F.CON_EMP_CD
        LEFT OUTER JOIN SEMP        E4 ON E4.EMP_CD = P.FIX_CD
        LEFT OUTER JOIN SDEPT       DP ON DP.DEPT_FG = E1.DEPT_FG AND DP.DEPT_CD = E1.DEPT_CD
        LEFT OUTER JOIN STRADE       T ON T.ROW_ID = P.CUST_ID
        LEFT OUTER JOIN SPROJECT    PT ON PT.PROJECT_FG = P.PROJECT_FG AND PT.PROJECT_CD = P.PROJECT_CD
        LEFT OUTER JOIN ( 
            SELECT T.DEVEL_NO, MAX(T.TEST_STEP_FG) TEST_STEP_FG,
                    STUFF(
                        (
                            SELECT DISTINCT 
                                    CASE WHEN ISNULL(A.TEST_DC, '') <> '' THEN '|' + '[' + CONVERT(VARCHAR, A.TEST_SQ) + ']' + ISNULL(E.EMP_NM, '') + '-' + ISNULL(M.MGM_NM, '') + '' + ISNULL(A.TEST_DC, '') ELSE '' END
                                FROM DTEST_HISTORY AS A
                                    LEFT OUTER JOIN SEMP AS E
                                        ON A.TEST_EMP_CD = E.EMP_CD
                                    LEFT OUTER JOIN DCTRL_MGM_D M 
                                        ON M.CTRL_CD = 'TR' AND M.MGM_CD = A.TEST_MGM_CD                 
                                WHERE A.DEVEL_NO = T.DEVEL_NO FOR XML PATH ('')
                        )
                    , 1, 1, '') AS TESTER_DC,
                    STUFF(
                        (
                            SELECT DISTINCT '|' + A.TEST_EMP_CD
                                FROM DTEST_HISTORY AS A
                                WHERE A.DEVEL_NO = T.DEVEL_NO FOR XML PATH ('')
                        )
                    , 1, 1, '') AS TEST_EMP_CD
                FROM DTEST_HISTORY AS T
                GROUP BY T.DEVEL_NO
        ) TE ON D.DEVEL_NO = TE.DEVEL_NO                            
        LEFT OUTER JOIN DCTRL_MGM_D MD ON MD.CTRL_CD = 'TS' AND MD.MGM_CD = TE.TEST_STEP_FG
    WHERE (
        P.PROD_FG IN('Q1','AX','DT', 'Q2', 'Q3', 'Q4') 
        OR CASE WHEN P.PROD_FG = 'G1' AND F.MOD_CD IN('B2', 'T2', 'TX', 'TH') THEN 1 ELSE 0 END = 1 
        OR CASE WHEN P.PROD_FG = 'BC' AND P.PROJECT_CD NOT IN (
                'P2-Q1-4-20201117-0001', 'P2-Q1-A-20200305-0001', 'P2-Q1-A-20200305-0002', 
                'P2-Q1-A-20200305-0003', 'P2-Q1-A-20200305-0004', 'P2-Q1-A-20200730-0001', 'P2-Q1-H-20200305-0001', 'P2-Q1-H-20200305-0002',
                'P2-Q1-H-20200305-0003', 'P2-Q1-H-20200305-0004', 'P2-Q1-H-20200730-0001', 'P2-Q1-S-20200305-0001', 'P2-Q1-S-20200901-0001'
            ) THEN 1 ELSE 0 END = 1
    )
	    AND ISNULL(P.PROJECT_CD, '') <> ''
        AND ISNULL(PT.EMP_CD, '') <> ''
        AND P.DEMAND_DT >= '20180101'	  
        AND ( 
            CONVERT(NVARCHAR, P.MODIFY_DT, 112) = @date OR 
            CONVERT(NVARCHAR, P.INSERT_DT, 112) = @date OR 
            CONVERT(NVARCHAR, D.MODIFY_DT, 112) = @date 
        )
UNION ALL
SELECT M.MODIFY_NO AS DEVPLAN_NO,
        M.PROJECT_CD,
        M.PROJECT_FG,
        PT.PROJECT_NM,
        F.MOD_CD,
        CASE WHEN(F.PROD_FG = 'G1') THEN GM.MGM_NM ELSE M2.MGM_NM END MOD_NM,
        CASE WHEN M.PROJECT_FG IN('PA', 'P9') THEN '전용개발' ELSE '패키지' END DEVMGM_FG_NM,
        DF.MGM_NM AS DEV_FG_NM,
        CASE WHEN M.PROJECT_FG IN('P1', 'P9') THEN '프로젝트' ELSE '유지보수' END PROJECT_FG_NM,                           
        M.DEMAND_DT,
        M.CONFIRM_CD AS DEMAND_CD,                          
        E3.EMP_NM AS DEMAND_NM,
        DP.DEPT_NM2 AS DEMAND_COM_NM,
        M.DEMAND_MGM_CD,  
        M7.MGM_NM AS DEMAND_MGM_NM,
        M.HAND_MGM_CD,    
        M.PROD_FG,
        M1.MGM_NM AS PROD_FG_NM,
        M.FILE_CD,  
        CASE WHEN M.FILE_CD = '예외' AND ISNULL(M.FILE_DC,'')<>'' THEN M.FILE_DC ELSE F.FILE_NM END FILE_NM_DC,
        M.FILE_DC,
        F.FILE_NM,
        M.PROJECT_FG,
        M.PROJECT_CD,
        PT.PROJECT_NM,  
		PT.REMARK_DC,
        M.CUST_ID,
        T.CUST_NM,    
        M.PLAN_CD,
        E5.EMP_NM AS PLAN_NM,
        E4.EMP_NM AS CON_EMP_NM,
        M.FIX_CD,
        E2.EMP_NM AS FIX_NM,
        M.CONFIRM_DT AS ASSAY_DT,
        M.CONFIRM_DT AS DEVPLAN_DT,
        M.CONFIRM_DT AS PLANST_DT,
        M.CONFIRM_DT AS PLANED_DT,
        M.CONFIRM_DT AS CONSULT_PLAN_END_DT,
        M.DELIVER_DT,
        M.CONFIRM_DT AS PLANED_DT,
        D.EDPLAN_DT,
        D.ENDDEMAIND_DT,
        D.DEVEL_DT,
        D.UPGRADE_DT,
        M.DEMAND_DC,
        M.ADD_DC,
        D.DEVEL_NO,
        CASE WHEN D.DEVEL_NO IS NULL THEN 'N' ELSE 'Y' END DEVEL_YN,                           
        D.DELAY_DC,
        D.TEST_DC,
		D.ASK_DC,
        NULL AS CONSULT_MGM_CD,
        NULL AS CONSULT_MGM_NM,
        CASE WHEN ISNULL(D.DEVEL_CD,'') <> '' THEN D.DEVEL_CD ELSE F.DEVEL_CD END DEVEL_CD,
		D.DEVDEMAIND_DT,
        D.UPGRADE_DT,
        D.TEST1_CD,
        CASE WHEN ISNULL(D.TEST2_CD,'') <> '' THEN D.TEST2_CD ELSE M.PLAN_CD END TEST2_CD,						
		D.TEST_CD,
        TE.TEST_EMP_CD,
        M4.MGM_NM AS TEST2_FG_NM,
		M5.MGM_NM AS TEST_FG_NM,                           
		CASE WHEN ISNULL(D.TEST_FG,'01') <> '01' THEN '최종-'+M5.MGM_NM
		    WHEN ISNULL(D.TEST2_FG,'01') <> '01' THEN '2차-'+M4.MGM_NM
			WHEN ISNULL(D.TEST1_FG,'01') <> '01' THEN '1차-'+M3.MGM_NM
			ELSE NULL END TEST_STATUS,
        TE.TESTER_DC,
        M9.MGM_NM HAND_MGM_NM,
        PT.MOD_CD AS PT_MOD_CD,
        D.JIRA_DEVEL_START_DT
    FROM DMODIFY AS M
        LEFT OUTER JOIN DEVMGM_D F ON F.PROD_FG = M.PROD_FG AND F.DEVMGM_FG = M.DEVMGM_FG AND F.FILE_CD = M.FILE_CD
        LEFT OUTER JOIN SEMP E1 ON E1.EMP_CD = M.DEMAND_CD
        LEFT OUTER JOIN SEMP E2 ON E2.EMP_CD = M.FIX_CD
        LEFT OUTER JOIN SEMP E3 ON E3.EMP_CD = M.CONFIRM_CD
        LEFT OUTER JOIN SEMP E4 ON E4.EMP_CD = M.CONFIRM_TO_EMP_CD
        LEFT OUTER JOIN SEMP E5 ON E5.EMP_CD = M.PLAN_CD
        LEFT OUTER JOIN SDEPT DP ON DP.DEPT_FG = E1.DEPT_FG AND DP.DEPT_CD = E1.DEPT_CD
        LEFT OUTER JOIN DEVEL D ON D.MODIFY_NO = M.MODIFY_NO AND ( D.CLONE_FG = '00' OR ( D.CLONE_FG = '02' AND D.REL_PROD_FG = 'Q1') )
        LEFT OUTER JOIN DCTRL_MGM_D M1 ON M1.CTRL_CD = 'GT' AND M1.MGM_CD = M.PROD_FG
        LEFT OUTER JOIN DCTRL_MGM_D M2 ON M2.CTRL_CD = 'MD' AND M2.MGM_CD = F.MOD_CD
        LEFT OUTER JOIN DCTRL_MGM_D M3 ON M3.CTRL_CD = 'TG' AND M3.MGM_CD = D.TEST1_FG
        LEFT OUTER JOIN DCTRL_MGM_D M4 ON M4.CTRL_CD = 'TG' AND M4.MGM_CD = D.TEST2_FG
        LEFT OUTER JOIN DCTRL_MGM_D M5 ON M5.CTRL_CD = 'TG' AND M5.MGM_CD = D.TEST_FG
        LEFT OUTER JOIN DCTRL_MGM_D M6 ON M6.CTRL_CD = 'DF' AND M6.MGM_CD = F.DEVMGM_FG
        LEFT OUTER JOIN DCTRL_MGM_D M7 ON M7.CTRL_CD = 'MT' AND M7.MGM_CD = M.DEMAND_MGM_CD
        LEFT OUTER JOIN DCTRL_MGM_D M8 ON M8.CTRL_CD = 'UT' AND M8.MGM_CD = M.WORK_MGM_CD
        LEFT OUTER JOIN DCTRL_MGM_D M9 ON M9.CTRL_CD = 'CT' AND M9.MGM_CD = M.HAND_MGM_CD
        LEFT OUTER JOIN DCTRL_MGM_D GM ON GM.CTRL_CD = 'GM' AND GM.MGM_CD = F.MOD_CD
        LEFT OUTER JOIN DCTRL_MGM_D DF ON DF.CTRL_CD = 'DF' AND DF.MGM_CD = M.DEVMGM_FG
        LEFT OUTER JOIN SPROJECT PT ON PT.PROJECT_FG = M.PROJECT_FG AND PT.PROJECT_CD = M.PROJECT_CD
        LEFT OUTER JOIN STRADE T ON T.ROW_ID = M.CUST_ID
        LEFT OUTER JOIN WEBCALL_SYNC_STATE W ON W.SEQ_DEV = M.SEQ_DEV
        LEFT OUTER JOIN ( 
            SELECT T.DEVEL_NO, MAX(T.TEST_STEP_FG) TEST_STEP_FG,
                    STUFF(
                        (
                            SELECT DISTINCT 
                                    CASE WHEN ISNULL(A.TEST_DC, '') <> '' THEN '|' + '[' + CONVERT(VARCHAR, A.TEST_SQ) + ']' + ISNULL(E.EMP_NM, '') + '-' + ISNULL(M.MGM_NM, '') + '' + ISNULL(A.TEST_DC, '') ELSE '' END
                                FROM DTEST_HISTORY AS A
                                    LEFT OUTER JOIN SEMP AS E ON A.TEST_EMP_CD = E.EMP_CD
                                    LEFT OUTER JOIN DCTRL_MGM_D M ON M.CTRL_CD = 'TR' AND M.MGM_CD = A.TEST_MGM_CD                 
                                WHERE A.DEVEL_NO = T.DEVEL_NO FOR XML PATH ('')
                        )
                    , 1, 1, '') AS TESTER_DC,
                    STUFF(
                        (
                            SELECT DISTINCT '|' + A.TEST_EMP_CD
                                FROM DTEST_HISTORY AS A
                                WHERE A.DEVEL_NO = T.DEVEL_NO FOR XML PATH ('')
                        )
                    , 1, 1, '') AS TEST_EMP_CD
                FROM DTEST_HISTORY AS T
                GROUP BY T.DEVEL_NO
        ) TE ON D.DEVEL_NO = TE.DEVEL_NO                                                    
        LEFT OUTER JOIN DCTRL_MGM_D MD ON MD.CTRL_CD = 'TS' AND MD.MGM_CD = TE.TEST_STEP_FG
    WHERE (
        M.PROD_FG IN('Q1','AX','DT', 'Q2', 'Q3', 'Q4') OR
	    CASE WHEN M.PROD_FG = 'G1' AND F.MOD_CD IN('B2', 'T2', 'TX', 'TH') THEN 1 ELSE 0 END = 1 OR
        CASE WHEN M.PROD_FG = 'BC' AND M.PROJECT_CD NOT IN (
                'P2-Q1-4-20201117-0001', 'P2-Q1-A-20200305-0001', 'P2-Q1-A-20200305-0002', 
                'P2-Q1-A-20200305-0003', 'P2-Q1-A-20200305-0004', 'P2-Q1-A-20200730-0001', 'P2-Q1-H-20200305-0001', 'P2-Q1-H-20200305-0002',
                'P2-Q1-H-20200305-0003', 'P2-Q1-H-20200305-0004', 'P2-Q1-H-20200730-0001', 'P2-Q1-S-20200305-0001', 'P2-Q1-S-20200901-0001'
            ) THEN 1 ELSE 0 END = 1
    )
        AND ISNULL(M.CONFIRM_CD, '') <> ''
        AND ISNULL(M.PROJECT_CD, '') <> ''
        AND ISNULL(D.DEVEL_NO, '') <> ''
        AND M.DEMAND_DT >= '20180101'    
        AND ( 
            CONVERT(NVARCHAR, M.MODIFY_DT, 112) = @date OR 
            CONVERT(NVARCHAR, M.INSERT_DT, 112) = @date OR 
            CONVERT(NVARCHAR, D.MODIFY_DT, 112) = @date 
        )