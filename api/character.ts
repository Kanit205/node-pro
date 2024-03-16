import mysql from 'mysql';
import express from 'express';
import { conn, queryAsync } from '../dbconn';

export const router = express.Router();

router.get("/", (req, res) => {
    if (req.query.uid) {
        conn.query(mysql.format(`SELECT * FROM CHARACTRE WHERE uid = ?`, [req.query.uid]), (err, result) => {
            if (err) throw err;
            else res.json(result);
        });
    } else {
        conn.query(mysql.format(`SELECT * FROM CHARACTRE WHERE cid = ?`, [req.query.cid]), (err, result) => {
            if (err) throw err;
            else res.json(result[0]);
        });
    }
});

router.get("/rank", async (req, res) => {
    const Yest =  await queryAsync(`SELECT c.cid, c.image, c.name, MAX(h.history_date) AS latest_date
                                    , MAX(h.history_point) AS latest_point
                                    , ROW_NUMBER() OVER (ORDER BY MAX(h.history_point) DESC) AS ranking 
                                    FROM CHARACTRE c INNER JOIN HISTORY h ON c.cid = h.cid 
                                    WHERE h.history_date < DATE_SUB(CURDATE(), INTERVAL 1 DAY) GROUP BY c.cid, c.image, c.name`);
                                    
    const Cur = await queryAsync(`SELECT c.cid, c.image, c.name, MAX(h.history_date) AS latest_date
                                , MAX(h.history_point) AS latest_point
                                , RANK() OVER (ORDER BY MAX(h.history_point) DESC) AS ranking 
                                FROM CHARACTRE c JOIN HISTORY h ON c.cid = h.cid GROUP BY c.cid`);
    res.json({
        Yest,
        Cur
    })
});

router.get("/graph", async (req, res) => {
    const graphData = await queryAsync(mysql.format(`SELECT * FROM HISTORY WHERE cid = ? AND DATE(history_date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`, [req.query.cid]));
    res.json({
        graphData
    });
})
