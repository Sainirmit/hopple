import { Request, Response, NextFunction, RequestHandler } from "express";
import { AuthRequest } from "../types";

/**
 * Async handler to wrap express route handlers
 * This eliminates the need for try/catch blocks in route handlers
 * and ensures proper error handling
 *
 * @param fn The async function to wrap
 * @returns A function that handles the promise resolution and error catching
 */
const asyncHandler = <T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Cast the request to the appropriate type and ensure we return nothing (void)
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
};

export default asyncHandler;
