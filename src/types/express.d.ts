import { JwtPayload } from "jsonwebtoken";
import { Server } from "socket.io";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { userId: string }; // JWT payload directly
      file?: Multer.File; // single file from multer
      files?: Multer.File[]; // multiple files from multer
      io: Server;
      socketUserMap: Map<string, string>;
    }
  }
}
declare module "socket.io" {
  interface Server {
    socketUserMap: Map<string, string>;
  }
}
