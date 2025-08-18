import { Router } from "express";
import clientInfoParser from "../../middleware/clientInfoParser";
import { UserController } from "./user.controller";
// import { UserRole } from "./user.interface";

const router = Router();

router.get("/", UserController.getAllUser);

router.get(
  "/me",

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

  UserController.updateUserStatus
);

export const UserRoutes = router;
