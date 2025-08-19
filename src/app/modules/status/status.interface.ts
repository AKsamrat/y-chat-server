import { Types } from "mongoose";

export interface IStatus {
  user: Types.ObjectId;
  content: string;
  contentType: string;
  viewers: Types.ObjectId[];
  expireAt: Date;
}
