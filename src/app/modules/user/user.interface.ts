import { Document, Model } from "mongoose";

// User Schema Definition
export interface IUser extends Document {
  email?: string;
  emailOtp?: string | null;
  emailOtpExpire?: Date | null;
  // password: string;
  phoneNumber: string;
  phoneSuffix: string;
  username: string;
  profilePicture: string;
  about: string;
  lastLogin: Date;
  isOnline: boolean;
  isVerified: boolean;
  agreed: boolean;
}

export interface UserModel extends Model<IUser> {
  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isUserExistsByEmail(id: string): Promise<IUser>;
  checkUserExist(userId: string): Promise<IUser>;
}
