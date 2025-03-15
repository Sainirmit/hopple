import { Response, NextFunction } from "express";
import { prisma } from "../index";
import {
  AuthRequest,
  SubtaskCreateData,
  SubtaskUpdateData,
  ProjectRoleEnum,
} from "../types";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";

/**
 * Get all subtasks for a task
 * @route GET /api/projects/:projectId/tasks/:taskId/subtasks
 * @access Private
 */
export const getSubtasks = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const { projectId, taskId } = req.params;

    // Check if user is a member of the project
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.user.id,
        },
      },
    });

    if (!projectMember) {
      throw AppError.forbidden("Not authorized to access this project");
    }

    // Check if task belongs to the project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.projectId !== projectId) {
      throw AppError.notFound("Task not found in this project");
    }

    // Get all subtasks for the task
    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });

    res.json(subtasks);
  }
);

/**
 * Get a subtask by ID
 * @route GET /api/projects/:projectId/tasks/:taskId/subtasks/:subtaskId
 * @access Private
 */
export const getSubtaskById = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const { projectId, taskId, subtaskId } = req.params;

    // Check if user is a member of the project
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.user.id,
        },
      },
    });

    if (!projectMember) {
      throw AppError.forbidden("Not authorized to access this project");
    }

    // Check if task belongs to the project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.projectId !== projectId) {
      throw AppError.notFound("Task not found in this project");
    }

    // Get the subtask
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
    });

    if (!subtask) {
      throw AppError.notFound("Subtask not found");
    }

    // Verify that the subtask belongs to the specified task
    if (subtask.taskId !== taskId) {
      throw AppError.badRequest(
        "Subtask does not belong to the specified task"
      );
    }

    res.json(subtask);
  }
);

/**
 * Create a new subtask
 * @route POST /api/projects/:projectId/tasks/:taskId/subtasks
 * @access Private
 */
export const createSubtask = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const { projectId, taskId } = req.params;
    const { title, description, status }: SubtaskCreateData = req.body;

    // Check if user is a member of the project
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.user.id,
        },
      },
    });

    if (!projectMember) {
      throw AppError.forbidden("Not authorized to access this project");
    }

    // Check if task belongs to the project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.projectId !== projectId) {
      throw AppError.notFound("Task not found in this project");
    }

    // Validate required fields
    if (!title) {
      throw AppError.badRequest("Please provide a title for the subtask");
    }

    // Create the subtask
    const subtask = await prisma.subtask.create({
      data: {
        taskId,
        title,
        description,
        status: status || "TODO",
      },
    });

    res.status(201).json(subtask);
  }
);

/**
 * Update a subtask
 * @route PUT /api/projects/:projectId/tasks/:taskId/subtasks/:subtaskId
 * @access Private
 */
export const updateSubtask = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const { projectId, taskId, subtaskId } = req.params;
    const { title, description, status }: SubtaskUpdateData = req.body;

    // Check if user is a member of the project
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.user.id,
        },
      },
    });

    if (!projectMember) {
      throw AppError.forbidden("Not authorized to access this project");
    }

    // Check if task belongs to the project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.projectId !== projectId) {
      throw AppError.notFound("Task not found in this project");
    }

    // Get the subtask to verify it exists and belongs to the task
    const existingSubtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
    });

    if (!existingSubtask) {
      throw AppError.notFound("Subtask not found");
    }

    if (existingSubtask.taskId !== taskId) {
      throw AppError.badRequest(
        "Subtask does not belong to the specified task"
      );
    }

    // Update the subtask
    const updatedSubtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      },
    });

    res.json(updatedSubtask);
  }
);

/**
 * Delete a subtask
 * @route DELETE /api/projects/:projectId/tasks/:taskId/subtasks/:subtaskId
 * @access Private
 */
export const deleteSubtask = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const { projectId, taskId, subtaskId } = req.params;

    // Check if user is a member of the project and has appropriate role
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.user.id,
        },
      },
    });

    if (!projectMember) {
      throw AppError.forbidden("Not authorized to access this project");
    }

    if (
      projectMember.role !== ProjectRoleEnum.OWNER &&
      projectMember.role !== ProjectRoleEnum.ADMIN
    ) {
      throw AppError.forbidden(
        "Only project owners and admins can delete subtasks"
      );
    }

    // Check if task belongs to the project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.projectId !== projectId) {
      throw AppError.notFound("Task not found in this project");
    }

    // Get the subtask to verify it exists and belongs to the task
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
    });

    if (!subtask) {
      throw AppError.notFound("Subtask not found");
    }

    if (subtask.taskId !== taskId) {
      throw AppError.badRequest(
        "Subtask does not belong to the specified task"
      );
    }

    // Delete the subtask
    await prisma.subtask.delete({
      where: { id: subtaskId },
    });

    res.json({ message: "Subtask deleted successfully" });
  }
);
