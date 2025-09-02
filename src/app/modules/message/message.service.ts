import { Request } from "express";
import { uploadFileToCloudinary } from "../../config/multer.config";
import { Conversation } from "../conversation/conv.model";
import { Message } from "./message.model";

const sendMessage = async (
  req: Request,
  senderId: string,
  receiverId: string,
  content: string,
  messageStatus: string,
  file?: Express.Multer.File
) => {
  const participants = [senderId, receiverId].sort();

  // check if conversation exists
  let conversation = await Conversation.findOne({ participants });
  if (!conversation) {
    conversation = new Conversation({ participants });
    await conversation.save();
  }

  let imageOrVideoUrl: string | null = null;
  let contentType: "text" | "image" | "video" | null = null;

  // handle file upload
  if (file) {
    const uploadFile = await uploadFileToCloudinary(file);
    if (!uploadFile?.secure_url) {
      throw new Error("Failed to upload media");
    }

    imageOrVideoUrl = uploadFile.secure_url;

    if (file.mimetype.startsWith("image")) {
      contentType = "image";
    } else if (file.mimetype.startsWith("video")) {
      contentType = "video";
    } else {
      throw new Error("Unsupported file type");
    }
  } else if (content?.trim()) {
    contentType = "text";
  } else {
    throw new Error("Message content is required");
  }

  // create new message
  const message = new Message({
    conversation: conversation._id,
    sender: senderId,
    receiver: receiverId,
    content,
    contentType,
    imageOrVideoUrl,
    messageStatus,
  });
  await message.save();

  //  update conversation
  if (message.content) {
    conversation.lastMessage = message.id;
  }
  conversation.unreadCount += 1;
  await conversation.save();

  //  populate message
  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "username profilePicture")
    .populate("receiver", "username profilePicture");
  //emit socket event for real time
  if (req.io && req.socketUserMap) {
    const receiverSocketId = req.socketUserMap.get(receiverId);
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit("receive_message", populatedMessage);
      message.messageStatus = "delivered";
      await message.save();
    }
  }

  return populatedMessage;
};

//get message of specific conversation

const getSpecificMessage = async (conversationId: string, userId: string) => {
  // Find the conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return { status: 404, message: "Conversation Not Found" };
  }

  //  Check if the user is a participant
  const isParticipant = conversation.participants.some(
    (id) => id.toString() === userId.toString()
  );
  if (!isParticipant) {
    return { status: 403, message: "Not Authorized to view this conversation" };
  }

  //  Get messages in this conversation
  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "username profilePicture")
    .populate("receiver", "username profilePicture")
    .sort({ createdAt: 1 });

  //  Mark unread messages as read for this user
  await Message.updateMany(
    {
      conversation: conversationId,
      receiver: userId,
      messageStatus: { $in: ["send", "delivered"] },
    },
    {
      $set: { messageStatus: "read" },
    }
  );

  //  Reset unread count in conversation
  conversation.unreadCount = 0;
  await conversation.save();

  return {
    status: 200,
    message: "Messages retrieved successfully",
    data: messages,
  };
};

const markAsRead = async (
  req: Request,
  messageIds: string[],
  userId: string
) => {
  // Find relevant messages
  const messages = await Message.find({
    _id: { $in: messageIds },
    receiver: userId,
  });

  //  Update message status to "read"
  await Message.updateMany(
    { _id: { $in: messageIds }, receiver: userId },
    { $set: { messageStatus: "read" } }
  );
  //notify to original sender
  if (req.io && req.socketUserMap) {
    for (const message of messages) {
      const senderSocketId = req.socketUserMap.get(message.sender.toString());
      if (senderSocketId) {
        const updateMessage = {
          _id: message._id,
          messageStatus: "read",
        };
        req.io.to(senderSocketId).emit("message_read", updateMessage);
        await message.save();
      }
    }
  }

  return { status: 200, message: "Messages marked as read", data: messages };
};

const deleteMessage = async (
  req: Request,
  messageId: string,
  userId: string
) => {
  //  Find the message
  const message = await Message.findById(messageId);
  if (!message) {
    return { status: 404, message: "Message Not Found" };
  }

  //  Check if the user is the sender
  if (message.sender.toString() !== userId) {
    return {
      status: 403,
      message: "You are not Authorized to delete this message",
    };
  }

  //  Delete the message
  await Message.deleteOne({ _id: messageId });

  //emit socket event
  if (req.io && req.socketUserMap) {
    const receiverSocketId = req.socketUserMap.get(message.receiver.toString());
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit("message_delete", messageId);
    }
  }

  return { status: 200, message: "Message deleted successfully" };
};

export const MessageService = {
  sendMessage,
  getSpecificMessage,
  markAsRead,
  deleteMessage,
};
