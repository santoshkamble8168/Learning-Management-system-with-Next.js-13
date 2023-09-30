import { Request, Response, NextFunction } from "express";
import asyncErrorHandler from "./asyncErrorHandler";
import { redis, verifyToken } from "../utils";
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
