/**
 * Custom error class for application errors
 * Extends the built-in Error class with additional properties
 */
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  /**
   * Create a new AppError
   * @param message Error message
   * @param statusCode HTTP status code (default: 500)
   */
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a not found error (404)
   * @param message Error message
   * @returns AppError instance
   */
  static notFound(message: string = "Resource not found"): AppError {
    return new AppError(message, 404);
  }

  /**
   * Create a bad request error (400)
   * @param message Error message
   * @returns AppError instance
   */
  static badRequest(message: string = "Bad request"): AppError {
    return new AppError(message, 400);
  }

  /**
   * Create an unauthorized error (401)
   * @param message Error message
   * @returns AppError instance
   */
  static unauthorized(message: string = "Unauthorized"): AppError {
    return new AppError(message, 401);
  }

  /**
   * Create a forbidden error (403)
   * @param message Error message
   * @returns AppError instance
   */
  static forbidden(message: string = "Forbidden"): AppError {
    return new AppError(message, 403);
  }

  /**
   * Create a conflict error (409)
   * @param message Error message
   * @returns AppError instance
   */
  static conflict(message: string = "Conflict"): AppError {
    return new AppError(message, 409);
  }

  /**
   * Create a server error (500)
   * @param message Error message
   * @returns AppError instance
   */
  static internal(message: string = "Internal server error"): AppError {
    return new AppError(message, 500);
  }
}

export default AppError;
