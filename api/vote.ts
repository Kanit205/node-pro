import mysql from 'mysql';
import express from 'express';
import { conn, queryAsync } from "../dbconn";
import { Charac2, CharacterGetRes } from '../model/character_post_req';
import Elo from '@studimax/elo';
import { HistoryGetRes } from '../model/history';

export const router = express.Router();

router.get('/', async (req, res) => {
    conn.query("select * from CHARACTRE order by rand() limit 2", (err, result) => {
        if (err) throw err;
        res.json(result);
    });
})

router.put('/', async (req, res) => {
    const vs: Charac2 = req.body;

    // await queryAsync(mysql.format(`UPDATE CHARACTRE SET old_point = total_point WHERE cid = ?`, [vs.win]));
    // await queryAsync(mysql.format(`UPDATE CHARACTRE SET old_point = total_point WHERE cid = ?`, [vs.lose]));

    // const elo = new Elo();
    // const { Ra:w, Rb:l } = elo.calculateRating(winBefore.total_point, loseBefore.total_point, 1);
    
    await queryAsync(mysql.format("update CHARACTRE set `total_point` = ? where `cid` = ?", [vs.winnew, vs.win]));
    await queryAsync(mysql.format("update CHARACTRE set `total_point` = ? where `cid` = ?", [vs.losenew, vs.lose]));
    
    const win: CharacterGetRes[] = await queryAsync(mysql.format("select * from CHARACTRE where cid = ?", [vs.win])) as CharacterGetRes[];
    const winBefore : CharacterGetRes = win[0];
    const winHis: HistoryGetRes[] = await queryAsync(mysql.format(`SELECT * FROM HISTORY WHERE cid = ? AND DATE(history_date) = CURDATE()`, [vs.win])) as HistoryGetRes[];

    if (!winHis[0]) {
        await queryAsync(mysql.format(`INSERT INTO HISTORY(cid, history_point, history_date) VALUES (?, ?, NOW())`, [vs.win, winBefore.total_point]));
    } else {
        await queryAsync(mysql.format(`UPDATE HISTORY SET history_point = ?, history_date = NOW() WHERE cid = ? AND DATE(history_date) = CURDATE()`, [winBefore.total_point, vs.win]));
    }

    const lose: CharacterGetRes[] = await queryAsync(mysql.format("select * from CHARACTRE where cid = ?", [vs.lose])) as CharacterGetRes[];
    const loseBefore : CharacterGetRes = lose[0];
    const loseHis: HistoryGetRes[] = await queryAsync(mysql.format(`SELECT * FROM HISTORY WHERE cid = ? AND DATE(history_date) = CURDATE()`, [vs.lose])) as HistoryGetRes[];

    if (!loseHis[0]) {
        await queryAsync(mysql.format(`INSERT INTO HISTORY(cid, history_point, history_date) VALUES (?, ?, NOW())`, [vs.lose, loseBefore.total_point]));
    } else {
        await queryAsync(mysql.format(`UPDATE HISTORY SET history_point = ?, history_date = NOW() WHERE cid = ? AND DATE(history_date) = CURDATE()`, [loseBefore.total_point, vs.lose]));
    }

    await queryAsync(mysql.format("insert into `VOTE` (uid, cid, point, date) value (?, ?, ?, NOW())", [vs.uid, vs.win, vs.winnew]));
    await queryAsync(mysql.format("insert into `VOTE` (uid, cid, point, date) value (?, ?, ?, NOW())", [vs.uid, vs.lose, vs.losenew]));

    res.status(200).json("UPDATE");
});
