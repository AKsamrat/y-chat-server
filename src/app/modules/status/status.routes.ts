import { Router } from "express";
import { multerMiddleWare } from "../../config/multer.config";
import { authMiddleware } from "../../middleware/authMiddleware";
import { StatusController } from "./status.controller";

const router = Router();

router.post(
  "/create-status",
  authMiddleware,
  multerMiddleWare,
  StatusController.createStatus
);
router.get("/get-status", StatusController.getStatus);
router.get(
  "/status/:statusId/view",
  authMiddleware,
  StatusController.viewStatus
);

export const StatusRoutes = router;
