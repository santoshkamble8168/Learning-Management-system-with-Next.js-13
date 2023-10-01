require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../middlewares";
import User from "../models/user.model";
import { redis, removeCookie, setCookie, verifyToken } from "../utils";
import { loginSchema, verificationSchema } from "../validations";

export const verifyAccount = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = verificationSchema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json({ success: false, error: error.details[0].message });
    }
    const { token } = value;

    try {
      // Verify the JWT token
      const decodedToken = verifyToken(token);

      if (!decodedToken || !decodedToken?._id) {
        return res.status(400).json({
          success: false,
          error: "Invalid activation token.",
        });
      }

      // Extract the user ID from the token
      const userId: string = decodedToken._id;

      // Find the user by ID
      const user = await User.findById(userId);

      // Check if the user exist
      if (!user)
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });

      // Check if the user is already activated
      if (user.isActive)
        return res.status(200).json({
          success: false,
          message: "Account is already verified.",
        });

      // Update the user's isActive status to true
      user.isActive = true;
      await user.save();

      res
        .status(200)
        .json({ success: true, message: "Account verified successfully." });
    } catch (error) {
      console.error("Account verification failed:", error);
      res
        .status(500)
        .json({ success: false, error: "Account verification failed." });
    }
  }
);

interface ILoginRequest {
  email: string;
  password: string;
}

export const login = asyncErrorHandler(
  async (req: Request<{}, {}, ILoginRequest>, res: Response) => {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json({ success: false, error: error.details[0].message });
    }
    const { email, password } = value;

    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res
        .status(400)
        .json({ success: false, error: "Invalid email or password" });

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched)
      return res
        .status(400)
        .json({ success: false, error: "Invalid email or password" });
    
    //send success response and set cookie to client
    setCookie(user, 200, res)
  }
);

export const logout = asyncErrorHandler(
  async (req: Request, res: Response) => {
    //remove cookie from client
    removeCookie(req?.user?._id, 200, res);
  }
);


export const updateAccessToken = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const refresh_token = req.cookies.refresh_token as string;

    if (!refresh_token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Refresh token is missing",
      });
    }

    const decodedToken = verifyToken(refresh_token, true);

    if (!decodedToken || !decodedToken._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid refresh token",
      });
    }

    const redisUser = await redis.get(decodedToken._id);

    if (!redisUser)
      return res.status(400).json({
        sucess: false,
        message: "Unauthorized: Invalid refresh token",
      });

    //get user from db as we are using accessToken and refreshToken methods from userSchema
    const user = await User.findById(decodedToken._id);

    if (!user) {
      //remove record from redis as its not available on db
      redis.del(decodedToken._id);
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    setCookie(user, 200, res);
  }
);
