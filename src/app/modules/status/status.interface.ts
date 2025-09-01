import { Document, Types } from "mongoose";

export interface IStatus extends Document {
  user: Types.ObjectId;
  content: string;
  contentType: string;
  viewers: Types.ObjectId[];
  expireAt: Date;
}
