import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { userId: string }; // JWT payload directly
      file?: Multer.File; // single file from multer
      files?: Multer.File[]; // multiple files from multer
    }
  }
}
