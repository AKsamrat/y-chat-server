import mongoose, { Model, Schema } from "mongoose";
import { IStatus } from "./status.interface";

const statusSchema = new Schema<IStatus>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },
    viewers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    expireAt: {
      type: Date,
      required: true,
      //   index: { expires: 0 },
    },
  },
  { timestamps: true }
);

// Create the model
export const Status: Model<IStatus> =
  mongoose.models.Status || mongoose.model<IStatus>("Status", statusSchema);
