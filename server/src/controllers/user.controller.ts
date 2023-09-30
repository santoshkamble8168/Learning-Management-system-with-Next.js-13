require("dotenv").config();
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { asyncErrorHandler } from "../middlewares";
import User from "../models/user.model";
import { generateToken } from "../utils";
import { sendActivationEmail } from "../emails";
import { registrationSchema } from "../validations";

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
      res
        .status(500)
        .json({ success: false, error: "User registration failed." });
    }
  }
);
