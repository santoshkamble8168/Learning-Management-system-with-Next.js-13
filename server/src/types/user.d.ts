export interface IImage extends Document {
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
