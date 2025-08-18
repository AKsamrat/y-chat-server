import { NextFunction, Request, Response } from "express";
import { JwtPayload, Secret } from "jsonwebtoken";
import config from "../config";
import { jwtHelpars } from "../utils/jwtHelpers";
import { response } from "../utils/responseHandler";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authToken = req.cookies?.Auth_token;
  if (!authToken) {
    return response(
      res,
      401,
      "Authorization Token Missing. Please provide token"
    );
  }

  try {
    const decoded = jwtHelpars.verifyToken(
      authToken,
      config.jwt_access_secret as Secret
    );

    // Narrow type safely
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded
    ) {
      req.user = decoded as JwtPayload & { userId: string };
      next();
    } else {
      return response(res, 401, "Invalid token payload");
    }
  } catch (error) {
    console.error(error);
    return response(res, 401, "Invalid or expired token");
  }
};
