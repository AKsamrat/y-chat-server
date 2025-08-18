import { UploadApiOptions } from "cloudinary";
import fs from "fs";
import multer from "multer";
import cloudinary from "./cloudinary.config";

export const uploadFileToCloudinary = (file: Express.Multer.File) => {
  const options: UploadApiOptions = {
    resource_type: file.mimetype.startsWith("video") ? "video" : "image",
    folder: "uploads",
  };

  return new Promise((resolve, reject) => {
    const uploader =
      file.mimetype.startsWith("video") && file.size > 100 * 1024 * 1024 // >100MB
        ? cloudinary.uploader.upload_large
        : cloudinary.uploader.upload;

    uploader(file.path, options, (error: any, result: any) => {
      // remove local temp file
      fs.unlink(file.path, () => {});

      if (error) {
        return reject(error);
      }
      resolve(result);
    });
  });
};

// Multer middleware
export const multerMiddleWare = multer({ dest: "uploads/" }).single("media");
