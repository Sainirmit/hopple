import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, AuthUser, UserRoleEnum } from "../types";
import { prisma } from "../index";
import AppError from "../utils/AppError";
import asyncHandler from "../utils/asyncHandler";

// Define a type that includes the role property
interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

/**
 * Middleware to protect routes
 * Verifies JWT token and attaches user to request
 * @access Public
 */
export const protect = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      try {
        // Verify token
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "secret"
        ) as jwt.JwtPayload;

        // Get user from the token
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
        });

        if (!user) {
          throw AppError.unauthorized("Not authorized, user not found");
        }

        // Cast the user to include the role property
        const userWithRole = user as unknown as UserWithRole;

        // Attach user to request
        req.user = {
          id: userWithRole.id,
          name: userWithRole.name,
          email: userWithRole.email,
          role: userWithRole.role as UserRoleEnum,
        };

        next();
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          throw AppError.unauthorized("Not authorized, token invalid");
        }
        if (error instanceof jwt.TokenExpiredError) {
          throw AppError.unauthorized("Not authorized, token expired");
        }
        throw error;
      }
    } else {
      throw AppError.unauthorized("Not authorized, no token");
    }
  }
);

/**
 * Middleware to require admin role
 * @access Private (Admin only)
 */
export const requireAdmin = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    if (req.user.role !== UserRoleEnum.ADMIN) {
      throw AppError.forbidden("Admin access required");
    }

    next();
  }
);

/**
 * Middleware to require admin or manager role
 * @access Private (Admin or Manager)
 */
export const requireAdminOrManager = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    if (
      req.user.role !== UserRoleEnum.ADMIN &&
      req.user.role !== UserRoleEnum.MANAGER
    ) {
      throw AppError.forbidden("Admin or manager access required");
    }

    next();
  }
);
