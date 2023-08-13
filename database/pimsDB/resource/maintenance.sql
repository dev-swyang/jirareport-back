SELECT D.MAINTAIN_NO,
        D.CUST_CD,
        ST.CUST_NM,
        D.PROD_FG,           
        M1.MGM_NM      PROD_FG_NM,
        D.DEVMGM_FG,
        M2.MGM_NM      MOD_NM,
        D.FILE_CD,
        F.FILE_NM,
        D.EMP_CD,
        E.EMP_NM,
        D.MAINTAIN_DT,
        D.MAINTAIN_DC,
        D.MAINTAIN_FG,
        D.MAINTAIN_ST,
        F.MOD_CD,
        D.FILE_NB,
        F1.FILE_CT,
        D.INSERT_ID,
        D.INSERT_IP,
        D.INSERT_DT,
        D.MODIFY_ID,
        D.MODIFY_IP,
        D.MODIFY_DT
    FROM DMAINTAIN D
        LEFT OUTER JOIN STRADE       ST ON ST.ROW_ID = D.CUST_CD
        LEFT OUTER JOIN DEVMGM_D      F ON F.PROD_FG = D.PROD_FG AND F.DEVMGM_FG = D.DEVMGM_FG AND F.FILE_CD = D.FILE_CD
        LEFT OUTER JOIN DCTRL_MGM_D  M1 ON M1.CTRL_CD = 'GT' AND M1.MGM_CD = D.PROD_FG
        LEFT OUTER JOIN DCTRL_MGM_D  M2 ON M2.CTRL_CD = 'MD' AND M2.MGM_CD = F.MOD_CD
        LEFT OUTER JOIN SEMP          E ON E.EMP_CD = D.EMP_CD
        LEFT OUTER JOIN SATTACH_FILE F1 ON F1.FILE_FG = 'P' AND F1.FILE_NB = D.FILE_NB
    WHERE (
        D.PROD_FG IN ('Q1','AX','DT', 'Q2', 'Q3', 'Q4', 'NH', 'BC') 
        OR CASE WHEN D.PROD_FG = 'G1' AND F.MOD_CD IN('B2', 'T2', 'TX', 'TH') THEN 1 ELSE 0 END = 1
    )                     
        AND D.MAINTAIN_DT >= '20180101'
        AND ( 
            CONVERT(NVARCHAR, D.MODIFY_DT, 112) = @date 
            OR CONVERT(NVARCHAR, D.INSERT_DT, 112) = @date 
        )