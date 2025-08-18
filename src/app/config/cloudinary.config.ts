import { v2 as cloudinary } from "cloudinary";
import config from ".";

export interface CloudinaryUploadResult {
  asset_id?: string;
  public_id?: string;
  secure_url?: string;
  url?: string;
  format?: string;
  resource_type?: string;
  [key: string]: any; // in case Cloudinary adds more fields
}

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export default cloudinary;
