require("dotenv").config();
import { Request, Response } from "express";
import { asyncErrorHandler } from "../middleware";
import User from "../models/user.model";
import { verifyToken } from "../utils";
import { verificationSchema } from "../validation";

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
      const decodedToken = await verifyToken(token);

      if (!decodedToken) {
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
