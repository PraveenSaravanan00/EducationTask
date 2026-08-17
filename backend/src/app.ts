import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./routers/authRouter.js";
import documentRouter from "./routers/documentRouter.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

connectDb();

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: 200, message: "Server is healthy" });
});

app.use("/auth", authRouter);
app.use("/documents", documentRouter);


app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

export default app;