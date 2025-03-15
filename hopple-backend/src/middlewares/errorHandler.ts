import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import AppError from "../utils/AppError";
import { logger } from "../utils/logger";

/**
 * Global error handler middleware
 * Handles errors from async route handlers
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Check if error is an instance of AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
    return;
  }

  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    res.status(400).json({
      message: "Database error occurred",
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
    return;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      message: "Invalid token. Please log in again.",
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
    return;
  }

  // Handle token expired error
  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      message: "Your token has expired. Please log in again.",
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
    return;
  }

  // Default to 500 server error for unhandled errors
  res.status(500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

/**
 * Not found middleware
 * Handles 404 errors for routes that don't exist
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  logger.warn({
    message: `Not Found - ${req.originalUrl}`,
    method: req.method,
    ip: req.ip,
  });
  next(AppError.notFound(`Not Found - ${req.originalUrl}`));
};
