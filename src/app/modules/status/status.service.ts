import { Response } from "express";
import { uploadFileToCloudinary } from "../../config/multer.config";
import { response } from "../../utils/responseHandler";
import { Status } from "./status.model";

const createStatus = async (
  userId: string,
  content: string,
  contentType: string,
  file?: Express.Multer.File
) => {
  let mediaUrl: string | null = null;
  let finalContentType: "text" | "image" | "video" = "text";

  // handle file upload
  if (file) {
    const uploadFile = await uploadFileToCloudinary(file);
    if (!uploadFile?.secure_url) {
      throw new Error("Failed to upload media");
    }

    mediaUrl = uploadFile.secure_url;

    if (file.mimetype.startsWith("image")) {
      finalContentType = "image";
    } else if (file.mimetype.startsWith("video")) {
      finalContentType = "video";
    } else {
      throw new Error("Unsupported file type");
    }
  } else if (content?.trim()) {
    finalContentType = "text";
  } else {
    throw new Error("Message content is required");
  }

  // Expiry in 24h
  const expireAt = new Date();
  expireAt.setHours(expireAt.getHours() + 24);

  // Create new status
  const status = new Status({
    user: userId,
    content: mediaUrl || content,
    contentType: finalContentType,
    viewers: [], // initially no viewers
    expireAt,
  });

  await status.save();

  // Populate status with user & viewers
  const populatedStatus = await Status.findById(status._id)
    .populate("user", "username profilePicture")
    .populate("viewers", "username profilePicture");

  return populatedStatus;
};

const getStatus = async () => {
  try {
    const status = await Status.find({
      expireAt: { $gt: new Date() }, // typo fixed: expireAt -> expireAt
    })
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture")
      .sort({ createdAt: -1 });

    return status;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch statuses");
  }
};

const viewStatus = async (statusId: string, userId: string, res: Response) => {
  try {
    const status = await Status.findById(statusId);
    if (!status) {
      return response(res, 404, "Status not found");
    }

    if (!status.viewers.includes(userId as any)) {
      status.viewers.push(userId as any);
      await status.save();
    }

    const updatedStatus = await Status.findById(statusId)
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture");

    return updatedStatus;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update status view");
  }
};

const deleteStatus = async (
  statusId: string,
  userId: string,
  res: Response
) => {
  try {
    const status = await Status.findById(statusId);
    if (!status) {
      return response(res, 404, "Status not found");
    }
    if (status.user.toString() !== userId) {
      return response(res, 403, "You are not Authorize to delete");
    }

    await status.deleteOne(); // Correct way to delete the found document
    return { success: true, code: 200, message: "Status deleted successfully" };
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete status");
  }
};

export const StatusService = {
  createStatus,
  getStatus,
  viewStatus,
  deleteStatus,
};
