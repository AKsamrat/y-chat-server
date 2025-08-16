import { Response } from "express";

export const response = <T>(
  res: Response, // ✅ Express Response type
  statusCode: number,
  message: string,
  data: T | null = null // ✅ generic type for `data`
) => {
  if (!res) {
    console.error("Response object is null");
    return;
  }

  const responseObject = {
    status: statusCode < 400 ? "success" : "error",
    message,
    data,
  };

  return res.status(statusCode).json(responseObject);
};
