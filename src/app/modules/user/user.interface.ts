import { Document, Model } from "mongoose";

// Enum for User Roles
export enum UserRole {
  ADMIN = "tutor",
  USER = "student",
}

// User Schema Definition
export interface IUser extends Document {
  email: string;
  password: string;
  phone: string;
  name: string;
  role: UserRole;
  lastLogin: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
