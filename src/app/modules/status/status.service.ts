import { uploadFileToCloudinary } from "../../config/multer.config";
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

export const StatusService = {
  createStatus,
};
