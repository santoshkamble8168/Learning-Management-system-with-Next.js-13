require("dotenv").config()
import mongoose, { Document, Model, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils";

export interface IAvatar extends Document {
  public_id: string;
  url: string;
}

// Define the User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: IAvatar | null;
  role: "student" | "instructor" | "admin";
  isActive: boolean;
  isDeleted: boolean;
  activationToken: string;
  courses: Types.ObjectId[]; // Array of Course IDs
  comparePassword: (password: string) => Promise<boolean>;
  accessToken: () => string;
  refreshToken: () => string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      validate: {
        validator: function (value: string) {
          // Simple email format validation
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          return emailRegex.test(value);
        },
        message: "Invalid email format.",
      },
    },
    password: {
      type: String,
      //required: [true, "Password is required."],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course", // Assuming you have a Course model
      },
    ],
  },
  {
    timestamps: true,
  }
);

//Function to hash the password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//access token
userSchema.methods.accessToken = function(){
  return generateToken(this._id)
}

//refresh access token
userSchema.methods.refreshToken = function(){
  return generateToken(this._id, true)
}

// Function to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create the User model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
