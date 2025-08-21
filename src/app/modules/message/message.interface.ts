import { Document, Types } from "mongoose";

export interface IMessage extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content: string;
  imageOrVideoUrl: string;
  contentType: "image" | "video" | "text";
  reactions: [
    {
      user: Types.ObjectId;
      emoji: string;
    }
  ];
  messageStatus: string;
}
