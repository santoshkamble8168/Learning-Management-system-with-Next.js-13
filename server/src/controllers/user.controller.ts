import { Request, Response, NextFunction } from "express";
import jwt, {Secret} from "jsonwebtoken"
import ejs from "ejs"
import path from "path"
import { asyncErrorHandler } from "../middleware";
import User from "../models/user.model";
import { sendEmail } from "../utils";

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

      // Create an activation token
      const activationToken = createActivationToken({ name, email, password });

      // Create a new user instance
      const newUser = {
        name,
        email,
        password,
        activationToken,
      };

      // Save the user to the database
      const user = await User.create(newUser);

      // Send an activation email
      const activationLink = `${process.env.BASE_URL}/verify-account/${activationToken}`;
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


export const createActivationToken = (user: IRegisterUser): string => {
  const expiresIn = "5m"; // Define the expiration time

  // Generate and return the JWT token as a string
  return jwt.sign({ user }, process.env.JWT_SECRET as Secret, {
    expiresIn,
  });
};

const sendActivationEmail = async (email: string, data: any) => {
  try {
    const html: string = await ejs.renderFile(
      path.join(__dirname, "../mails/user-activation.ejs"),
      data
    );

    await sendEmail({
      email,
      subject: "Activate your account",
      html,
    });
  } catch (error) {
    console.error("Failed to send activation email:", error);
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    // Find the user with the matching activationCode and check if it's not verified
    const user = await User.findOneAndUpdate(
      { activationToken: token, isVerified: false },
      { $set: { isVerified: true }, $unset: { activationToken: 1 } },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({
          error: "Activation token invalid or account is already verified.",
        });
    }

    res
      .status(200)
      .json({ success: true, message: "Account verified successfully." });
  } catch (error) {
    console.error("Account verification failed:", error);
    res.status(500).json({ error: "Account verification failed." });
  }
};