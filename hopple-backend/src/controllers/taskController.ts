import { Response, NextFunction } from "express";
import { prisma } from "../index";
import {
  AuthRequest,
  TaskCreateData,
  TaskUpdateData,
  ProjectRoleEnum,
  TaskStatusEnum,
} from "../types";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";

/**
 * Get all tasks for a project
 * @route GET /api/projects/:projectId/tasks
 * @access Private
 */
export const getProjectTasks = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const projectId = req.params.projectId;

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

    // Get all tasks for the project
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
    });

    res.json(tasks);
  }
);

/**
 * Get a task by ID
 * @route GET /api/projects/:projectId/tasks/:taskId
 * @access Private
 */
export const getTaskById = asyncHandler<AuthRequest>(
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

    // Get the task
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
        projectId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        subtasks: true,
      },
    });

    if (!task) {
      throw AppError.notFound("Task not found");
    }

    res.json(task);
  }
);

/**
 * Create a task
 * @route POST /api/projects/:projectId/tasks
 * @access Private
 */
export const createTask = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const projectId = req.params.projectId;
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId,
    }: TaskCreateData = req.body;

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

    // Validate required fields
    if (!title) {
      throw AppError.badRequest("Please provide a title for the task");
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || TaskStatusEnum.TODO,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId,
        projectId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json(task);
  }
);

/**
 * Update a task
 * @route PUT /api/projects/:projectId/tasks/:taskId
 * @access Private
 */
export const updateTask = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const { projectId, taskId } = req.params;
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId,
    }: TaskUpdateData = req.body;

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

    // Check if task exists
    const taskExists = await prisma.task.findUnique({
      where: {
        id: taskId,
        projectId,
      },
    });

    if (!taskExists) {
      throw AppError.notFound("Task not found");
    }

    // If the task is being assigned to a user, verify that user is a member of the project
    if (assigneeId) {
      const assigneeMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: assigneeId,
          },
        },
      });

      if (!assigneeMember) {
        throw AppError.badRequest("Assignee must be a member of the project");
      }
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        assigneeId: assigneeId === null ? null : assigneeId || undefined,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(updatedTask);
  }
);

/**
 * Delete a task
 * @route DELETE /api/projects/:projectId/tasks/:taskId
 * @access Private
 */
export const deleteTask = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const { projectId, taskId } = req.params;

    // Check if user is a member of the project with appropriate permissions
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

    // Check if the user has appropriate permissions (owner, admin, or task is assigned to them)
    if (
      projectMember.role !== ProjectRoleEnum.OWNER &&
      projectMember.role !== ProjectRoleEnum.ADMIN
    ) {
      // If not owner/admin, check if the task is assigned to the user
      const task = await prisma.task.findUnique({
        where: {
          id: taskId,
          projectId,
        },
      });

      if (!task || task.assigneeId !== req.user.id) {
        throw AppError.forbidden("Not authorized to delete this task");
      }
    }

    // Delete the task (cascade will handle related records)
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    res.json({ message: "Task deleted successfully" });
  }
);

/**
 * Helper function to update project progress based on task completion
 */
const updateProjectProgress = async (projectId: string) => {
  const tasks = await prisma.task.findMany({
    where: { projectId },
  });

  if (tasks.length === 0) {
    // No tasks, set progress to 0
    await prisma.project.update({
      where: { id: projectId },
      data: { progress: 0 },
    });
    return;
  }

  const completedTasks = tasks.filter((task) => task.status === "COMPLETED");
  const progressPercentage = Math.round(
    (completedTasks.length / tasks.length) * 100
  );

  await prisma.project.update({
    where: { id: projectId },
    data: { progress: progressPercentage },
  });
};
