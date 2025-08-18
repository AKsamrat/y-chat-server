import { UploadApiResponse } from "cloudinary";
import { Request, Response } from "express";
import config from "../../config";
import { uploadFileToCloudinary } from "../../config/multer.config";
import { sendOtpToEmail } from "../../utils/emailService";
import { otpGenerator } from "../../utils/otpGenerate";
import {
  sendOtpToPhoneNumber,
  twilioVerifyOtp,
} from "../../utils/twilloService";
import User from "../user/user.model";
import { createToken } from "./auth.utils";
const sendOtp = async (
  email?: string,
  phoneNumber?: string,
  phoneSuffix?: string
) => {
  const otp = otpGenerator();
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  let user = null;

  if (email) {
    user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
    }
    user.emailOtp = otp;
    user.emailOtpExpire = expiry;
    await user.save();

    await sendOtpToEmail(email, otp);

    return { type: "email", email };
  }

  if (phoneNumber && phoneSuffix) {
    const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
    user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ phoneNumber, phoneSuffix });
    }
    user.emailOtp = otp;
    user.emailOtpExpire = expiry;
    await user.save();

    await sendOtpToPhoneNumber(fullPhoneNumber);

    return { type: "phone", phoneNumber: fullPhoneNumber };
  }

  throw new Error("Email or phone number is required");
};

interface VerifyOtpBody {
  phoneNumber?: string;
  phoneSuffix?: string;
  email?: string;
  otp: string;
}

const verifyOtp = async (body: VerifyOtpBody) => {
  const { phoneNumber, phoneSuffix, email, otp } = body;
  let user = null;

  if (email) {
    user = await User.findOne({ email });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const now = new Date();
    if (
      !user.emailOtp ||
      String(user.emailOtp) !== String(otp) ||
      now > new Date(user.emailOtpExpire as Date)
    ) {
      throw new Error("INVALID_OTP");
    }

    user.isVerified = true;
    user.emailOtp = null;
    user.emailOtpExpire = null;
    await user.save();
    const jwtPayload = {
      userId: user._id as string,
      name: user.username as string,
      email: user.email as string,
      isOnline: user.isOnline,
    };

    const token = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string
    );

    console.log(token);

    return { type: "email", user };
  }

  if (!phoneNumber || !phoneSuffix) {
    throw new Error("PHONE_REQUIRED");
  }

  const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
  user = await User.findOne({ phoneNumber });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const result = await twilioVerifyOtp(fullPhoneNumber, otp);
  if (result.status !== "approved") {
    throw new Error("INVALID_OTP");
  }

  const jwtPayload = {
    userId: user._id as string,
    name: user.username as string,
    email: user.email as string,
    isOnline: user.isOnline,
  };

  const token = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  console.log(token);

  return { type: "phone", user, token };
};

const updateProfile = async (req: Request) => {
  const { username, agreed, about } = req.body;
  const userId = req.user.userId; // assuming req.user is set by auth middleware

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Handle file upload
  if (req.file) {
    const uploadResult = (await uploadFileToCloudinary(
      req.file
    )) as UploadApiResponse;
    user.profilePicture = uploadResult.secure_url;
  }

  // Update fields
  if (username) user.username = username;
  if (agreed !== undefined) user.agreed = agreed;
  if (about) user.about = about;

  await user.save();

  return user;
};

const checkAuthenticated = async (userId: string) => {
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
};

const logout = (res: Response) => {
  // clear the cookie by setting it to empty + expired date
  res.cookie("Auth_token", "", { expires: new Date(0), httpOnly: true });
  return true;
};

export const AuthService = {
  sendOtp,
  verifyOtp,
  updateProfile,
  logout,
  checkAuthenticated,

  // refreshToken,
};
