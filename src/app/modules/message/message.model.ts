import mongoose, { Model, Schema } from "mongoose";
import { IMessage } from "./message.interface";

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation", // reference Conversation model
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User", // reference User model
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User", // reference User model
      required: true,
    },
    content: {
      type: String,
      required: false, // optional if sending only image/video
    },
    imageOrVideoUrl: {
      type: String, // could be URL/path to image/video
      required: false,
    },
    contentType: {
      type: String,
      enum: ["image", "video", "text"],
      default: "text",
    },
    reaction: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: {
          type: String,
        },
      },
    ],
    messageStatus: {
      type: String,
      enum: ["send", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);
