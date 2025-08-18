import { Request, Response } from "express";
import { response } from "../../utils/responseHandler";
import { AuthService } from "./auth.service";

interface VerifyOtpBody {
  phoneNumber?: string;
  phoneSuffix?: string;
  email?: string;
  otp: string;
}

const sendOtp = async (req: Request, res: Response) => {
  const { phoneNumber, phoneSuffix, email } = req.body;

  try {
    const result = await AuthService.sendOtp(email, phoneNumber, phoneSuffix);

    if (result.type === "email") {
      return response(res, 200, "OTP sent to your Email", {
        email: result.email,
      });
    }

    if (result.type === "phone") {
      return response(res, 200, "OTP sent to your Phone", {
        phoneNumber: result.phoneNumber,
      });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    return response(res, 500, "Internal Server Error");
  }
};

const verifyOtp = async (
  req: Request<{}, {}, VerifyOtpBody>,
  res: Response
) => {
  try {
    const result = await AuthService.verifyOtp(req.body);
    res.cookie("Auth_token", result.token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });
    if (result.type === "email") {
      return response(res, 200, "Email verified successfully", {
        user: result.user,
        token: result.token,
      });
    }

    if (result.type === "phone") {
      res.cookie("Auth_token", result.token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      });
      return response(res, 200, "Phone verified successfully", {
        token: result.token,
        user: result.user,
      });
    }
  } catch (error: any) {
    console.error("Error verifying OTP:", error);

    if (error.message === "USER_NOT_FOUND") {
      return response(res, 404, "User not found");
    }
    if (error.message === "INVALID_OTP") {
      return response(res, 400, "Invalid or expired OTP");
    }
    if (error.message === "PHONE_REQUIRED") {
      return response(res, 400, "Phone number and suffix are required");
    }

    return response(res, 500, "Internal Server Error");
  }
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = await AuthService.updateProfile(req);

    return response(res, 200, "User profile updated successfully", user);
  } catch (error: any) {
    console.error(error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    await AuthService.logout(res);
    return response(res, 200, "User Logout Successful");
  } catch (error: any) {
    console.error("Error in logout:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};
const checkAuthenticated = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId; // comes from your auth middleware
    console.log(userId);
    const user = await AuthService.checkAuthenticated(userId as string);

    return response(res, 200, "User retrieved and allowed to use Y-Chat", user);
  } catch (error: any) {
    console.error("Error in checkAuthenticated:", error);

    if (error.message === "UNAUTHORIZED") {
      return response(
        res,
        400,
        "Unauthorized! Please login before accessing this page"
      );
    }
    if (error.message === "USER_NOT_FOUND") {
      return response(res, 400, "User not found");
    }

    return response(res, 500, error.message || "Internal Server Error");
  }
};

const getAllUser = async (req: Request, res: Response) => {
  try {
    const loggedInUser = req.user?.userId; // set from authMiddleware

    if (!loggedInUser) {
      return response(res, 401, "Unauthorized! Please login first");
    }

    const users = await AuthService.getAllUser(loggedInUser);

    return response(res, 200, "Users retrieved successfully", users);
  } catch (error: any) {
    console.error("Error in getAllUser:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

export const AuthController = {
  sendOtp,
  verifyOtp,
  updateProfile,
  logout,
  checkAuthenticated,
  getAllUser,
};
