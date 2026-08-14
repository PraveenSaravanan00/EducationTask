import express, { Request, Response } from "express";
import connectDb from "./config/db.js";

const app = express();
app.use(express.json())
connectDb()
app.get("/health", (req: Request, res: Response) => {
    res.send({ "status": 200, "message": "App is healthy" })
})

// app.use("/",)

export default app;