import { Response, NextFunction } from "express";
import { prisma } from "../index";
import {
  AuthRequest,
  ProjectCreateData,
  ProjectUpdateData,
  ProjectRoleEnum,
  UserRoleEnum,
} from "../types";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";

/**
 * Get all projects for the authenticated user
 * @route GET /api/projects
 * @access Private
 */
export const getProjects = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    // Get all projects that the user is a member of
    const projectMembers = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      include: {
        project: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            tasks: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // Transform the response to a more suitable format
    const projects = projectMembers.map((pm) => {
      const { project } = pm;
      const members = project.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatarUrl: member.user.avatarUrl,
        role: member.role,
      }));

      const taskStats = {
        total: project.tasks.length,
        completed: project.tasks.filter((task) => task.status === "COMPLETED")
          .length,
      };

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        progress: project.progress,
        dueDate: project.dueDate,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        members,
        taskStats,
        role: pm.role,
      };
    });

    // Remove duplicate projects (same ID)
    const uniqueProjects = Array.from(
      new Map(projects.map((project) => [project.id, project])).values()
    );

    res.json(uniqueProjects);
  }
);

/**
 * Get a project by ID
 * @route GET /api/projects/:id
 * @access Private
 */
export const getProjectById = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const projectId = req.params.id;

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

    // Get the project with detailed information
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        tasks: {
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
        },
      },
    });

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    // Transform the response to a more suitable format
    const members = project.members.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatarUrl: member.user.avatarUrl,
      role: member.role,
    }));

    const tasks = project.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
            avatarUrl: task.assignee.avatarUrl,
          }
        : null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));

    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((task) => task.status === "COMPLETED").length,
    };

    res.json({
      id: project.id,
      title: project.title,
      description: project.description,
      progress: project.progress,
      dueDate: project.dueDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      members,
      tasks,
      taskStats,
      userRole: projectMember.role,
    });
  }
);

/**
 * Create a new project
 * @route POST /api/projects
 * @access Private (Admin and Manager only)
 */
export const createProject = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    // Store user information after validation
    const currentUser = req.user;

    // Check if user is admin or manager
    if (
      currentUser.role !== UserRoleEnum.ADMIN &&
      currentUser.role !== UserRoleEnum.MANAGER
    ) {
      throw AppError.forbidden("Only admin and manager can create projects");
    }

    const { title, description, dueDate, members }: ProjectCreateData =
      req.body;

    // Validate required fields
    if (!title || !dueDate) {
      throw AppError.badRequest("Please provide title and due date");
    }

    // Create the project with the current user as the owner
    const project = await prisma.project.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        members: {
          create: {
            userId: currentUser.id,
            role: ProjectRoleEnum.OWNER,
          },
        },
      },
    });

    // Add additional members if provided
    if (members && members.length > 0) {
      // Verify all users exist before adding them
      const existingUsers = await prisma.user.findMany({
        where: {
          id: {
            in: members,
          },
        },
        select: {
          id: true,
        },
      });

      const validUserIds = existingUsers.map((user) => user.id);

      // Only add members that exist and are not already the owner
      const validMembers = validUserIds.filter((id) => id !== currentUser.id);

      if (validMembers.length > 0) {
        // Add members one by one to handle potential errors gracefully
        for (const userId of validMembers) {
          try {
            await prisma.projectMember.create({
              data: {
                userId,
                projectId: project.id,
                role: ProjectRoleEnum.MEMBER,
              },
            });
          } catch (error) {
            // Log the error but continue with other members
            console.error(`Failed to add member ${userId} to project: `, error);
          }
        }
      }
    }

    // Fetch the created project with members
    const createdProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!createdProject) {
      throw AppError.internal("Failed to retrieve created project");
    }

    // Transform the response to a more suitable format
    const formattedMembers = createdProject.members.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatarUrl: member.user.avatarUrl,
      role: member.role,
    }));

    const taskStats = {
      total: 0,
      completed: 0,
    };

    res.status(201).json({
      id: createdProject.id,
      title: createdProject.title,
      description: createdProject.description,
      progress: createdProject.progress,
      dueDate: createdProject.dueDate,
      createdAt: createdProject.createdAt,
      updatedAt: createdProject.updatedAt,
      members: formattedMembers,
      taskStats,
    });
  }
);

/**
 * Update a project
 * @route PUT /api/projects/:id
 * @access Private
 */
export const updateProject = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const projectId = req.params.id;
    const { title, description, dueDate, progress }: ProjectUpdateData =
      req.body;

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
      throw AppError.forbidden("Not authorized to update this project");
    }

    if (
      projectMember.role !== ProjectRoleEnum.OWNER &&
      projectMember.role !== ProjectRoleEnum.ADMIN
    ) {
      throw AppError.forbidden("Only owners and admins can update projects");
    }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(progress !== undefined && { progress }),
      },
    });

    res.json(updatedProject);
  }
);

/**
 * Delete a project
 * @route DELETE /api/projects/:id
 * @access Private
 */
export const deleteProject = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const projectId = req.params.id;

    // Check if user is the owner of the project
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.user.id,
        },
      },
    });

    if (!projectMember || projectMember.role !== ProjectRoleEnum.OWNER) {
      throw AppError.forbidden("Only the project owner can delete the project");
    }

    // Delete the project (cascade will handle related records)
    await prisma.project.delete({
      where: { id: projectId },
    });

    res.json({ message: "Project deleted successfully" });
  }
);
