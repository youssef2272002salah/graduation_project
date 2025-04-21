import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import mongoose from "mongoose";
import { logger } from "./logging";

/**
 * Handles Mongoose CastError (Invalid ObjectId, etc.)
 */
const handleCastErrorDB = (err: mongoose.Error.CastError): AppError => {
  return new AppError(
    `Invalid value: '${err.value}' for field '${err.path}'`,
    400
  );
};

/**
 * Handles Duplicate Field Errors (MongoDB)
 */
const handleDuplicateFieldsDB = (): AppError => {
  return new AppError("Duplicate field value. Please use a unique value.", 400);
};

/**
 * Handles JWT Errors (Invalid or Expired)
 */
const handleJWTError = (): AppError =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = (): AppError =>
  new AppError("Token expired. Please log in again.", 401);

/**
 * Sends Error Response in Production
 */
const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  if (res.headersSent) return;

  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

/**
 * Global Error Handling Middleware
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error =
    err instanceof AppError
      ? err
      : new AppError(err.message || "An error occurred", err.statusCode || 500);

  // Default status and error type
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  // Handle Specific Error Types
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map(
      (e) => (e as mongoose.Error.ValidatorError).message
    );
    return res.status(400).json({ status: "fail", messages });
  }
  if (err instanceof mongoose.Error.CastError) error = handleCastErrorDB(err);
  if ((err as any).code === 11000) error = handleDuplicateFieldsDB();
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  // Log error only ONCE
  logger.error({
    message: error.message,
    stack: error.stack,
    status: error.status,
    statusCode: error.statusCode,
  });

  // Send error response
  sendErrorProd(error, req, res);
};
