require("dotenv").config();
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { asyncErrorHandler } from "../middleware";
import User from "../models/user.model";
import { generateToken, sendActivationEmail, verifyToken } from "../utils";

//register user
// Interface for user registration data
interface IRegisterUser {
  name: string;
  email: string;
  password: string;
}

export const registerUser = asyncErrorHandler(
  async (req: Request<{}, {}, IRegisterUser>, res: Response) => {
    const { name, email, password } = req.body;

    try {
      // Check if the user with the same email already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res
          .status(400)
          .json({ error: "User with this email already exists." });
      }

      //hashed the pain password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user instance
      const newUser = {
        name,
        email,
        password: hashedPassword,
      };

      // Save the user to the database
      const user = await User.create(newUser);

      // Create an activation token
      const activationToken = generateToken(user);

      // Send an activation email
      const activationLink = `${process.env.CLIENT_URL}/verify-account/${activationToken}`;
      const data = { user: { name: user.name }, activationLink };

      await sendActivationEmail(user.email, data);

      res.status(201).json({
        success: true,
        message: `Please check your email (${user.email}) to activate your account.`,
      });
    } catch (error) {
      console.error("User registration failed:", error);
      res.status(500).json({ error: "User registration failed." });
    }
  }
);

export const verifyAccount = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    // Verify the JWT token
    const decodedToken = await verifyToken(token);

    if (!decodedToken) {
      return res.status(400).json({
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
};
