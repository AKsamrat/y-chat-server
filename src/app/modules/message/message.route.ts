import { Router } from "express";
import { MessageController } from "./message.controller";

const router = Router();

router.post("/send-message", MessageController.sendMessage);

export const AuthRoutes = router;
