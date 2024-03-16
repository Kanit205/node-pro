import mysql from 'mysql';
import express from 'express';
import { conn } from "../dbconn";
import { AuthenPostReq } from '../model/authen_post_req';

export const router = express.Router();

router.get("/", (req, res) => {
    let sql, param;
    if (req.query.email) {
        sql = "select * from USER where email =?";
        param = req.query.email;
    } else {
        sql = "select * from USER where uid = ?";
        param = req.query.uid;
    }
    conn.query(sql, [param], (err, result) => {
        if (err) throw err;
        else res.json(result[0]);
    });
});

router.post("/", (req, res) => {
    const user: AuthenPostReq = req.body;
    let sql =
        "insert into `USER` (`type`, `name`, `email`, `password`, `img_limit`) values (?, ?, ?, ?, ?)";
    sql = mysql.format(sql, [
        user.type,
        user.name,
        user.email,
        user.password,
        user.img_limit
    ]);

    conn.query(sql, (err, result) => {
        if (err) throw err;
        res
            .status(201)
            .json({
                affected_row: result.affectedRows,
                last_idx: result.insertId
            });
    });
});