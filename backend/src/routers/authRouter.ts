import { Router } from "express";
import {
  register,
  login,
  refreshTokens,
  logout,
  getMe,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refreshTokens);
authRouter.post("/logout", logout);

authRouter.get("/me", authMiddleware, getMe);

export default authRouter;
