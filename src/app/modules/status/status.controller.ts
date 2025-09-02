import { Request, Response } from "express";
import { response } from "../../utils/responseHandler";
import { Status } from "./status.model";
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

    //emit socket event
    if (req.io && req.socketUserMap) {
      //Broadcast to all connecting user except the creator
      for (const [connectingUserId, socketId] of req.socketUserMap) {
        if (connectingUserId !== userId) {
          req.io.to(socketId).emit("new_status", status);
        }
      }
    }

    return response(res, 200, "Message sent successfully", status);
  } catch (error: any) {
    console.error("Error in sendMessage:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

const getStatus = async (req: Request, res: Response) => {
  try {
    const statuses = await StatusService.getStatus();
    return response(res, 200, "Status retrieved successfully", statuses);
  } catch (error: any) {
    console.error("Error in getStatusController:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

const viewStatus = async (req: Request, res: Response) => {
  const { statusId } = req.params;
  const userId = (req as any).user.userId;

  try {
    const status = await Status.findById(statusId);
    if (!status) {
      return response(res, 404, "Status not found");
    }

    if (!status.viewers.includes(userId as any)) {
      status.viewers.push(userId as any);
      await status.save();
    }
    const updatedStatus = await StatusService.viewStatus(statusId, userId, res);

    if (!updatedStatus) {
      return response(res, 404, "Status not found");
    }

    //emit socket event
    if (req.io && req.socketUserMap) {
      //Broadcast to all connecting user except the creator
      const statusOwnerSocketId = req.socketUserMap.get(
        status.user._id.toString()
      );
      if (statusOwnerSocketId) {
        const viewData = {
          statusId,
          viewerId: userId,
          totalViewers: updatedStatus.viewers.length,
          viewers: updatedStatus.viewers,
        };
        res.io.to(statusOwnerSocketId).emit("status_viewed", viewData);
      } else {
        console.log("user already viewed the status");
      }
    }

    return response(res, 200, "Status viewed successfully", updatedStatus);
  } catch (error: any) {
    console.error("Error in viewStatusController:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

const deleteStatus = async (req: Request, res: Response) => {
  const { statusId } = req.params;
  const userId = (req as any).user.userId;

  try {
    const result = await StatusService.deleteStatus(statusId, userId, res);

    if (!result) {
      return response(res, 404, "Status not found");
    }

    //emit socket event
    if (req.io && req.socketUserMap) {
      for (const [connectingUserId, socketId] of req.socketUserMap) {
        if (connectingUserId !== userId) {
          req.io.to(socketId).emit("status_deleted", statusId);
        }
      }
    }
    return response(res, 200, "Status Delete Successfully");
  } catch (error: any) {
    console.error("Error in deleteStatusController:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

export const StatusController = {
  createStatus,
  getStatus,
  viewStatus,
  deleteStatus,
};
