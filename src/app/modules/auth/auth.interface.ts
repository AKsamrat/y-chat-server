import { Request, Response } from "express";
import { otpGenerator } from "../../utils/otpGenerate";
import { response } from "../../utils/responseHandler";
import User from "../user/user.model";

export interface IAuth {
  email: string;
  password: string;
}

export const sendOtp = async (req: Request, res: Response) => {
  const { phoneNumber, phoneSuffix, email } = req.body;
  const otp = otpGenerator();
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    let user = null;

    if (email) {
      user = await User.findOne({ email });

      if (!user) {
        user = new User({ email });
      }

      user.emailOtp = otp;
      user.emailOtpExpire = expiry;
      await user.save();

      return response(res, 200, "OTP sent to your Email", { email });
    }
    const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;

    if (phoneNumber && phoneSuffix) {
      user = await User.findOne({ phoneNumber });

      if (!user) {
        user = new User({ phoneNumber, phoneSuffix });
      }

      user.emailOtp = otp; // or user.phoneOtp if you separate them
      user.emailOtpExpire = expiry;
      await user.save();

      return response(res, 200, "OTP sent to your Phone", {
        // phoneNumber,
        // phoneSuffix,
        user,
      });
    }

    return response(res, 400, "Email or phone number is required");
  } catch (error) {
    console.error("Error sending OTP:", error);
    return response(res, 500, "Internal Server Error");
  }
};

export interface IJwtPayload {
  userId: string;
  name: string;
  email: string;
  hasShop?: boolean;
  // role: UserRole;
  isActive: boolean;
}
