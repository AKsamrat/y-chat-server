import { Router } from "express";
import { multerMiddleWare } from "../../config/multer.config";
import { authMiddleware } from "../../middleware/authMiddleware";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/send-otp", AuthController.sendOtp);
router.post("/verify-otp", AuthController.verifyOtp);
router.get("/logout", AuthController.logout);
router.put(
  "/updateProfile",
  authMiddleware,
  multerMiddleWare,
  AuthController.updateProfile
);

export const AuthRoutes = router;
