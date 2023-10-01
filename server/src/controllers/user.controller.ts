require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../middlewares";
import User, { IAvatar } from "../models/user.model";
import { generateToken, imageDestroyer, imageUploader, redis, setCookie } from "../utils";
import { sendActivationEmail } from "../emails";
import { registrationSchema, updateProfileSchema, changePasswordSchema } from "../validations";
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
  avatar?: string;
}

export const updateProfile = asyncErrorHandler(
  async (req: Request<{}, {}, IUpdateUser>, res: Response) => {
    const {
      error,
      value: { name, avatar },
    } = updateProfileSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const userId = req.user?._id;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) {
      user.name = name;
    }

    if (avatar) {
      if (user?.avatar?.public_id) {
        await imageDestroyer(user.avatar.public_id);
      }

      const cloudAvatar = await imageUploader(avatar, {
        folder: "avatars",
        width: 150,
      });

      user.avatar = {
        public_id: cloudAvatar.public_id,
        url: cloudAvatar.secure_url,
      } as IAvatar;
    }

    const updatedUser = await user.save();
    await redis.set(userId, JSON.stringify(updatedUser));

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      item: updatedUser,
    });
  }
);


interface IChangePassword {
  oldPassword: string;
  password: string;
}

export const changePassword = asyncErrorHandler(
  async (req: Request<{}, {}, IChangePassword>, res: Response) => {

    const { error, value } = changePasswordSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { oldPassword, password } = value;

    const user = await getUserById(req.user?._id, true);
    
    if (!user || !user.password) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatched = await user?.comparePassword(oldPassword)

    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid old password",
      });
    }

    //update the password
    user.password = password
    await user.save()

    //update redis db
    await redis.set(user._id, JSON.stringify(user));

    const userResponse = { ...user.toJSON() };
   delete (userResponse as any).password;

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      item: userResponse,
    });
  }
);