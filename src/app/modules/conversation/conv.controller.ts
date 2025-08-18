import { Request, Response } from "express";
import { response } from "../../utils/responseHandler";
import { ConversationService } from "./conv.service";

export const getConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId; // ✅ assuming user is injected via auth middleware
    const conversations = await ConversationService.getConversation(userId);

    return response(
      res,
      200,
      "Conversation retrieved successfully",
      conversations
    );
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

export const ConversationController = {
  getConversation,
};
