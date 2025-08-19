import { Router } from "express";
import { multerMiddleWare } from "../../config/multer.config";
import { authMiddleware } from "../../middleware/authMiddleware";
import { MessageController } from "./message.controller";

const router = Router();

router.post(
  "/send-message",
  authMiddleware,
  multerMiddleWare,
  MessageController.sendMessage
);
router.get(
  "/get-specificMessage/:conversationId/messages",
  authMiddleware,
  MessageController.getSpecificMessage
);
router.put("/mark-asRead", authMiddleware, MessageController.markAsRead);
router.delete(
  "/message-delete/:messageId",
  authMiddleware,
  MessageController.deleteMessage
);

export const MessageRoutes = router;
