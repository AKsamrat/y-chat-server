import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { ConversationController } from "./conv.controller";

const router = Router();

router.get(
  "/get-conversation",
  authMiddleware,
  ConversationController.getConversation
);

export const ConversationRoutes = router;
