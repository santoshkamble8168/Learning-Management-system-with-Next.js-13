import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils";

const ErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Handle CastError (Mongoose cast error)
  if (err.name === "CastError") {
    statusCode = 400; // Bad Request
    message = `Resource not found. Invalid: ${err.path}`;
  }

  // Handle duplicate key error (MongoDB)
  if (err.code === 11000) {
    statusCode = 400; // Bad Request
    message = `Duplicate: ${Object.keys(err.keyValue)} entered`;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 400; // Bad Request
    message = "Json web token is invalid or expired. Please try again.";
  }

  // Create an error response object
  const errorResponse = new ErrorHandler(message, statusCode);

  // Send the error response to the client
  res.status(errorResponse.statusCode).json({
    success: false,
    message: errorResponse.message,
  });
};

export default ErrorMiddleware