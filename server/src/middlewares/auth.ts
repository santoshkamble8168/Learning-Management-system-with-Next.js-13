import { Request, Response, NextFunction } from "express";
import asyncErrorHandler from "./asyncErrorHandler";
import {redis, verifyToken } from "../utils";
import { IUser } from "../models/user.model";

declare module "express" {
  interface Request {
    user?: IUser;
  }
}

export const isAuthenticated = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.access_token as string;

    if (!accessToken)
      return res.status(400).json({
        sucess: false,
        message: "Please login to access this resource",
      });

    const decodedToken = verifyToken(accessToken);

    if (!decodedToken || !decodedToken?._id)
      return res.status(400).json({
        sucess: false,
        message: "access token is not valid",
      });

    const user = await redis.get(decodedToken._id);

    if (!user)
      return res.status(400).json({
        sucess: false,
        message: "user not found",
      });

    req.user = JSON.parse(user) as IUser;

    next();
  }
);

export const isAuthorized = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: User does not have the required role",
      });
    }

    next(); // User has the required role, proceed to the next middleware
  };
};
