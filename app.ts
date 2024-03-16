import express from "express";
import { router as authen } from "./api/authen";
import { router as uploads} from "./api/uploads";
import { router as vote } from "./api/vote";
import { router as character } from "./api/character";
import bodyParser from "body-parser";
import cors from "cors";

export const app = express();

app.use(
    cors({
        origin: "*",
    })
);

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use("/authen", authen);
app.use("/uploads", uploads);
app.use("/vote", vote);
app.use("/character", character);
