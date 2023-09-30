import jwt, { Secret, VerifyErrors, JwtPayload } from "jsonwebtoken";
import { IUser } from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET as Secret;
const JWT_EXPIRE = process.env.JWT_EXPIRE as string;

export const generateToken = (user: IUser): string => {
  const payload = {
    ...user.toObject(), // Convert Mongoose user to a plain JavaScript object
    // Add any other claims you want to include in the token
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

export const verifyToken = async (token: string): Promise<IUser | null> => {
  try {
    const decodedToken = await new Promise<any>((resolve, reject) => {
      jwt.verify(
        token,
        JWT_SECRET,
        (error: VerifyErrors | null, decoded: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(decoded);
          }
        }
      );
    });

    // Token verification succeeded, return the decoded user object
    const user: IUser = decodedToken;
    return user;
  } catch (error) {
    // Token verification failed
    console.error("Token verification failed:", error);
    return null;
  }
};