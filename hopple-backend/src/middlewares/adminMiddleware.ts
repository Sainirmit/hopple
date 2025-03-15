import { Response, NextFunction } from "express";
import { AuthRequest, UserRoleEnum } from "../types";

/**
 * Middleware to restrict access to admin users only
 */
export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  // Check if the user has admin role
  if (req.user.role !== UserRoleEnum.ADMIN) {
    return res
      .status(403)
      .json({ message: "Not authorized, admin access required" });
  }

  next();
};

/**
 * Middleware to restrict access to admin or manager users
 */
export const adminOrManagerOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  // Check if the user has admin or manager role
  if (
    req.user.role !== UserRoleEnum.ADMIN &&
    req.user.role !== UserRoleEnum.MANAGER
  ) {
    return res
      .status(403)
      .json({ message: "Not authorized, manager access required" });
  }

  next();
};
