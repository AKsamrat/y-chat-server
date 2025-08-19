import { Request, Response } from "express";
import { response } from "../../utils/responseHandler";
import { StatusService } from "./status.service";

const createStatus = async (req: Request, res: Response) => {
  try {
    const { content, contentType } = req.body;
    const userId = req.user.userId;
    const file = req.file;

    const status = await StatusService.createStatus(
      userId,
      content,
      contentType,
      file
    );

    return response(res, 200, "Message sent successfully", status);
  } catch (error: any) {
    console.error("Error in sendMessage:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

export const StatusController = {
  createStatus,
};
