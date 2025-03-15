import express, { Request, Response, NextFunction } from "express";
import { protect } from "../middlewares/authMiddleware";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// All task routes are now handled within the project routes
// This is just a placeholder to handle the direct /api/tasks endpoint
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw AppError.badRequest(
      "Please use the project-specific task endpoints: /api/projects/:projectId/tasks"
    );
  })
);

export default router;
