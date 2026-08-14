import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/token.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access denied. Token is missing.",
    });
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof Error && err.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token expired. Please refresh your token.",
        code: "TOKEN_EXPIRED",
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

export default authMiddleware;
