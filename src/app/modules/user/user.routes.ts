import { Router } from "express";
import auth from "../../middleware/auth";
import clientInfoParser from "../../middleware/clientInfoParser";
import { UserController } from "./user.controller";
import { UserRole } from "./user.interface";

const router = Router();

router.get("/", auth(UserRole.ADMIN, UserRole.USER), UserController.getAllUser);

router.get(
  "/me",
  auth(UserRole.ADMIN, UserRole.USER),
  UserController.myProfile
);

router.post(
  "/",
  clientInfoParser,
  // validateRequest(UserValidation.userValidationSchema),
  UserController.registerUser
);
// update profile
// router.patch(
//    '/update-profile',
//    auth(UserRole.USER),
//    multerUpload.single('profilePhoto'),
//    parseBody,
//    validateRequest(UserValidation.customerInfoValidationSchema),
//    UserController.updateProfile
// );

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  UserController.updateUserStatus
);

export const UserRoutes = router;
