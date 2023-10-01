require("dotenv").config();
import { Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import { IUser } from "../models/user.model";
import { redis } from "./redis";

const JWT_SECRET = process.env.JWT_SECRET as Secret;
const JWT_EXPIRE = process.env.JWT_EXPIRE as string;

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as Secret;
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE as string;

const NODE_ENV = process.env.NODE_ENV as string;

export const generateToken = (
  userId: string,
  isRefreshToken: boolean = false
): string => {
  const payload = {
    _id: userId
  };
  return jwt.sign(payload, isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET, {
    expiresIn: isRefreshToken ? JWT_REFRESH_EXPIRE : JWT_EXPIRE,
  });
};

export const verifyToken = (
  token: string,
  isRefreshToken: boolean = false
): { _id: string } | null => {
  try {
    const payload = jwt.verify(
      token,
      isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET
    ) as { _id: string };
    return payload;
  } catch (error) {
    // Token verification failed
    console.error("Token verification failed:", error);
    return null;
  }
};

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

export const setCookie = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.accessToken();
  const refreshToken = user.refreshToken();

  //upload session to redis
  redis.set(user._id, JSON.stringify(user) as any)

  const accessTokenExpire = parseInt(JWT_EXPIRE || "300", 10);
  const refreshTokenExpire = parseInt(JWT_REFRESH_EXPIRE || "600", 10);

  const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 1000),
    maxAge: accessTokenExpire * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 1000),
    maxAge: refreshTokenExpire * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  //only set secure to true if production
  if (NODE_ENV === "production") {
    accessTokenOptions.secure = true;
  }

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    message: "user logged in",
    item: { access_token: accessToken },
  });
};

export const removeCookie = (_id: string, statusCode: number, res: Response) => {
  //remove record from redis
  redis.del(_id);

  res.cookie("access_token", "", { maxAge: 1 });
  res.cookie("refresh_token", "", { maxAge: 1 });

  res.status(statusCode).json({
    success: true,
    message: "user logged out",
  });
}