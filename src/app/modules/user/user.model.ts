import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import mongoose, { Schema } from "mongoose";
import config from "../../config";
import AppError from "../../errors/appError";
import { IUser, UserModel } from "./user.interface";

// Create the User schema based on the interface
const userSchema = new Schema<IUser, UserModel>(
  {
    username: {
      type: String,
      // required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    emailOtp: {
      type: String,
    },
    emailOtpExpire: {
      type: Date,
      // required: true,
      // unique: true,
      // lowercase: true,
    },
    profilePicture: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      sparse: true,
    },
    phoneSuffix: {
      type: String,
      unique: true,
    },
    about: {
      type: String,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    agreed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;

  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds)
  );

  next();
});

userSchema.post("save", function (doc, next) {
  doc.password = "";
  next();
});

userSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.password;
    return ret;
  },
});

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select("+password");
};

userSchema.statics.checkUserExist = async function (userId: string) {
  const existingUser = await this.findById(userId);

  if (!existingUser) {
    throw new AppError(StatusCodes.NOT_ACCEPTABLE, "User does not exist!");
  }

  if (!existingUser.isOnline) {
    throw new AppError(StatusCodes.NOT_ACCEPTABLE, "User is not active!");
  }

  return existingUser;
};

const User = mongoose.model<IUser, UserModel>("User", userSchema);
export default User;
