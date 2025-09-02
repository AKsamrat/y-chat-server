import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import http from "http";
import { StatusCodes } from "http-status-codes";
import * as os from "os";
import initializeSocket from "../src/app/utils/socketService";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import router from "./app/routes";

const app: Application = express();

// Middleware setup
app.use(cors({ origin: "http://localhost:5173" }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//create server
const serverS = http.createServer(app);
const io = initializeSocket(serverS);

//apply socket middleware before routes
app.use((req, res, next) => {
  req.io = io;
  req.socketUserMap = io.socketUserMap;

  res.io = io;
  res.socketUserMap = io.socketUserMap;

  next();
});

app.use("/api/v1", router);

// seedAdmin();

// Test route
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  const currentDateTime = new Date().toISOString();
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const serverHostname = os.hostname();
  const serverPlatform = os.platform();
  const serverUptime = os.uptime();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Welcome to eTutor",
    version: "1.0.0",
    clientDetails: {
      ipAddress: clientIp,
      accessedAt: currentDateTime,
    },
    serverDetails: {
      hostname: serverHostname,
      platform: serverPlatform,
      uptime: `${Math.floor(serverUptime / 60 / 60)} hours ${Math.floor(
        (serverUptime / 60) % 60
      )} minutes`,
    },
  });
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default serverS; // Export the app for use in server.ts
