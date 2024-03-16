import { queryAsync } from './../dbconn';
import mysql from 'mysql';
import { conn } from "../dbconn";
import express from "express";
import multer from "multer";
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, uploadBytesResumable} from "firebase/storage";

export const router = express.Router();

const firebaseConfig = {
    apiKey: "AIzaSyAbtTVwJZfgSzrj5vkYV-mkxJ2bWSTpH0o",
    authDomain: "anihot-72a0a.firebaseapp.com",
    projectId: "anihot-72a0a",
    storageBucket: "anihot-72a0a.appspot.com",
    messagingSenderId: "1035115883061",
    appId: "1:1035115883061:web:615f0bd0dc8f1d89429f7c",
    measurementId: "G-VXRZW76JSN"
};

initializeApp(firebaseConfig);

const storage = getStorage();

class FileMiddleware {
    filename = "";
    public readonly diskLoader = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 67108864,
        },
    });
}

const fileUpload = new FileMiddleware();

router.post("/GetUrl", fileUpload.diskLoader.single("img"), async(req, res) => {
    const filename = Math.round(Math.random() * 10000) + ".png";
    const storageRef = ref(storage, "ImgCharacter/" + filename);
    const metadata = {
        contentType: req.file!.mimetype
    }
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    res.status(200).json({ filename: downloadUrl });
});

router.post("/uploadToDB", async (req, res) => {
    queryAsync(mysql.format("insert into `CHARACTRE` (`uid`, `image`, `name`, `total_point`, `old_point`, `date`) value (?, ?, ?, ?, ?, NOW())", [req.body.uid, req.body.imgUrl, req.body.character, 1000, 0]));
});

router.put("/imglimit", (req, res) => {
    conn.query(mysql.format(`UPDATE USER SET img_limit = img_limit + 1 WHERE uid = ?`, [req.query.uid]), (err, result) => {
        if (err) throw err;
        res.status(201).json({ 
            affected_row: result.affectedRows,
        });
    });
});

router.put("/ImgProfile", fileUpload.diskLoader.single("img"), async(req, res) => {
    const filename = Math.round(Math.random() * 10000) + ".png";
    const storageRef = ref(storage, "ImgProfile/" + filename);
    const metadata = {
        contentType: req.file!.mimetype
    }
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    // res.status(200).json({ filename: downloadUrl });

    conn.query(mysql.format(`UPDATE USER SET image = ? WHERE uid = ?`, [downloadUrl, req.body.uid]), (err, result) => {
        if (err) throw err;
        res.status(200).json({
            affected_row: result.affectedRows,
        });
    });
});

