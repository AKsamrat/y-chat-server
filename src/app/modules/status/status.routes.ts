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
router.delete("/:get-statusId", StatusController.deleteStatus);
router.put(
  "/status-view/:statusId",
  authMiddleware,
  StatusController.viewStatus
);

export const StatusRoutes = router;
