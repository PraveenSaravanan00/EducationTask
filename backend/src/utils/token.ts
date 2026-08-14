import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env["JWT_ACCESS_SECRET"] ?? "fallback_access_secret";
const REFRESH_SECRET = process.env["JWT_REFRESH_SECRET"] ?? "fallback_refresh_secret";

const ACCESS_EXPIRES: SignOptions["expiresIn"] = "15m";
const REFRESH_EXPIRES: SignOptions["expiresIn"] = "7d";

export interface TokenPayload {
  userId: string;
  email: string;
}


export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload as object, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
};


export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload as object, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
};


export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};


export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};
