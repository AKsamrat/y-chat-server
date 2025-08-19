// controllers/message.controller.ts
import { Request, Response } from "express";
import { response } from "../../utils/responseHandler";
import { MessageService } from "./message.service";

const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, content, messageStatus } = req.body;
    const file = req.file;

    const message = await MessageService.sendMessage(
      senderId,
      receiverId,
      content,
      messageStatus,
      file
    );

    return response(res, 200, "Message sent successfully", message);
  } catch (error: any) {
    console.error("Error in sendMessage:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

const getSpecificMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId; // injected via auth middleware

    const result = await MessageService.getSpecificMessage(
      conversationId,
      userId
    );

    return response(res, result.status, result.message, result.data);
  } catch (error: any) {
    console.error("Error in getSpecificMessage:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

const markAsRead = async (req: Request, res: Response) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.userId;

    const result = await MessageService.markAsRead(messageIds, userId);

    return response(res, result.status, result.message, result.data);
  } catch (error: any) {
    console.error("Error in markAsRead:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId; // injected via auth middleware

    const result = await MessageService.deleteMessage(messageId, userId);

    return response(res, result.status, result.message);
  } catch (error: any) {
    console.error("Error in deleteMessage:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

export const MessageController = {
  sendMessage,
  getSpecificMessage,
  markAsRead,
  deleteMessage,
};
