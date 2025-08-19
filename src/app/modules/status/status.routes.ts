import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { StatusController } from "./status.controller";
import { multerMiddleWare } from "../../config/multer.config";

const router = Router();

router.get(
  "/get-conversation",
  authMiddleware,
  multerMiddleWare,
  StatusController.createStatus
);

export const StatusRoutes = router;
