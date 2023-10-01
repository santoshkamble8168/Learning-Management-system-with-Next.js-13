require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { asyncErrorHandler } from "../middlewares";
import User from "../models/user.model";
import { generateToken, redis, setCookie } from "../utils";
import { sendActivationEmail } from "../emails";
import { registrationSchema, updateProfileSchema } from "../validations";
import { getUserByField, getUserById } from "../services";

//register user
// Interface for user registration data
interface IRegisterUser {
  name: string;
  email: string;
  password: string;
}

export const registerUser = asyncErrorHandler(
  async (req: Request<{}, {}, IRegisterUser>, res: Response) => {
    const { error, value } = registrationSchema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json({ success: false, error: error.details[0].message });
    }

    const { name, email, password } = value;

    try {
      // Check if the user with the same email already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "User with this email already exists.",
        });
      }

      // Create a new user instance
      const newUser = {
        name,
        email,
        password,
      };

      // Save the user to the database
      const user = await User.create(newUser);

      // Create an activation token
      const activationToken = generateToken(user._id);

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
      res
        .status(500)
        .json({ success: false, error: "User registration failed." });
    }
  }
);

export const getUserProfile = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    //const user = await getUserById(userId)
    const user = await redis.get(userId);

    if (!user) {
      return res.status(200).json({
        success: false,
        message: "user not found",
      });
    }

    //here we can also send a req.user it hold the same information about user
    res.status(200).json({
      success: true,
      item: JSON.parse(user),
    });
  }
);

interface ISocialAuthBody {
  email: string;
  name: string;
  avatar: string;
}

export const socialAuth = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, avatar } = req.body as ISocialAuthBody;

    const user = await getUserByField({ email });

    if (!user) {
      //create a new user and set cookies
      const newUser = await User.create({ name, email, avatar });
      setCookie(newUser, 201, res);
    } else {
      //if user exist set cookies
      setCookie(user, 201, res);
    }
  }
);

interface IUpdateUser {
  name?: string;
  password?: string;
  avatar?: string;
}

export const updateProfile = asyncErrorHandler(
  async (req: Request<{}, {}, IUpdateUser>, res: Response) => {

    const { error, value } = updateProfileSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { password, name, avatar } = value;

    // Find the user by ID
    const user = await getUserById(req.user?._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update the password if provided
    if (password) {
      // Hash the new password and update it
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Update the name and avatar if provided
    if (name) {
      user.name = name;
    }
    if (avatar) {
      user.avatar = avatar;
    }

    // Save the updated user
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  }
);
