import mongoose, { Document, Model, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

interface IAvatar extends Document {
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
  isVerified: boolean;
  activationToken: string;
  courses: Types.ObjectId[]; // Array of Course IDs
}

const userSchema = new Schema<IUser>({
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
    required: [true, "Password is required."],
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
  isVerified: {
    type: Boolean,
    default: false,
  },
  activationToken: {
     type: String,
  },
  courses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Course", // Assuming you have a Course model
    },
  ],
},{
    timestamps: true
});

// Create the User model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

//Function to hash the password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Function to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default User;
