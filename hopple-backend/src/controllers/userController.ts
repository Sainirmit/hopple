import { Response } from "express";
import { prisma } from "../index";
import { AuthRequest, UserRoleEnum } from "../types";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import { Prisma } from "@prisma/client";

// We need to use type assertion for role fields since Prisma types don't match TypeScript expectations
type PrismaUser = Prisma.UserGetPayload<{}>;
type UserWithRole = PrismaUser & { role: string };

/**
 * Get all users
 * @route GET /api/users
 * @access Private (Any authenticated user)
 */
export const getUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // We need to fetch the full user to get the role
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const fullUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        return {
          ...user,
          role: fullUser ? (fullUser as unknown as UserWithRole).role : null,
        };
      })
    );

    res.json(usersWithRoles);
  }
);

/**
 * Get a user by ID
 * @route GET /api/users/:id
 * @access Private (Self or Admin/Manager)
 */
export const getUserById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const userId = req.params.id;

    // Check access permission - users can only view their own profile unless they are admin/manager
    const isSelfOrAdmin =
      req.user.id === userId ||
      req.user.role === UserRoleEnum.ADMIN ||
      req.user.role === UserRoleEnum.MANAGER;

    if (!isSelfOrAdmin) {
      throw AppError.forbidden("Not authorized to view this user");
    }

    // Get basic user info
    const userBasic = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!userBasic) {
      throw AppError.notFound("User not found");
    }

    // Get full user for role
    const userFull = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Get tasks assigned to the user
    const assignedTasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
      },
    });

    // Get projects the user is a member of
    const projectMembers = await prisma.projectMember.findMany({
      where: { userId: userId },
      select: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            progress: true,
            dueDate: true,
          },
        },
        role: true,
      },
    });

    // Transform the response to a more suitable format
    const projects = projectMembers.map((pm) => ({
      ...pm.project,
      role: pm.role,
    }));

    // Combine all data
    res.json({
      id: userBasic.id,
      name: userBasic.name,
      email: userBasic.email,
      avatarUrl: userBasic.avatarUrl,
      role: userFull ? (userFull as unknown as UserWithRole).role : null,
      createdAt: userBasic.createdAt,
      assignedTasks,
      projects,
    });
  }
);

/**
 * Delete a user
 * @route DELETE /api/users/:id
 * @access Private (Self or Admin only)
 */
export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const userId = req.params.id;

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToDelete) {
      throw AppError.notFound("User not found");
    }

    // Check access permission - users can only delete themselves unless they are admin
    const isSelfOrAdmin =
      req.user.id === userId || req.user.role === UserRoleEnum.ADMIN;

    if (!isSelfOrAdmin) {
      throw AppError.forbidden("Not authorized to delete this user");
    }

    // Prevent deleting the last admin
    const userRole = (userToDelete as unknown as UserWithRole).role;
    if (userRole === "ADMIN") {
      // Find admin users using a raw query to avoid type issues
      const adminUsers = await prisma.$queryRaw`
      SELECT * FROM "users" WHERE "role" = 'ADMIN'
    `;

      if (Array.isArray(adminUsers) && adminUsers.length <= 1) {
        throw AppError.badRequest(
          "Cannot delete the last admin user. Promote another user to admin first."
        );
      }
    }

    // Check if user has any projects where they are the owner
    const ownedProjects = await prisma.projectMember.findMany({
      where: {
        userId: userId,
        role: "OWNER",
      },
    });

    if (ownedProjects.length > 0) {
      throw AppError.badRequest(
        "Cannot delete user who owns projects. Transfer ownership or delete projects first."
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: "User deleted successfully" });
  }
);

/**
 * Update a user
 * @route PUT /api/users/:id
 * @access Private (Self or Admin)
 */
export const updateUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    const userId = req.params.id;
    const { name, avatarUrl, role } = req.body;

    // Check if user exists
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUpdate) {
      throw AppError.notFound("User not found");
    }

    // Check access permission
    const isSelf = req.user.id === userId;
    const isAdmin = req.user.role === UserRoleEnum.ADMIN;

    if (!isSelf && !isAdmin) {
      throw AppError.forbidden("Not authorized to update this user");
    }

    // Only admins can change roles
    if (role && !isAdmin) {
      throw AppError.forbidden("Only admins can change user roles");
    }

    // Prevent changing own role if admin (to prevent lockout)
    if (role && isSelf && isAdmin) {
      // Find admin users using a raw query to avoid type issues
      const adminUsers = await prisma.$queryRaw`
      SELECT * FROM "users" WHERE "role" = 'ADMIN'
    `;

      if (
        Array.isArray(adminUsers) &&
        adminUsers.length <= 1 &&
        role !== UserRoleEnum.ADMIN
      ) {
        throw AppError.badRequest(
          "Cannot change role of the last admin. Promote another user to admin first."
        );
      }
    }

    // Create update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (role && isAdmin) updateData.role = role;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Get the updated user's role
    const userWithRole = await prisma.user.findUnique({
      where: { id: updatedUser.id },
    });

    res.json({
      ...updatedUser,
      role: userWithRole
        ? (userWithRole as unknown as UserWithRole).role
        : null,
    });
  }
);

/**
 * Change user role (Admin only)
 * @route PATCH /api/users/:id/role
 * @access Private (Admin only)
 */
export const changeUserRole = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw AppError.unauthorized("Not authorized");
    }

    // Check if requester is admin
    if (req.user.role !== UserRoleEnum.ADMIN) {
      throw AppError.forbidden("Admin access required");
    }

    const userId = req.params.id;
    const { role } = req.body;

    // Validate role
    if (!role || !Object.values(UserRoleEnum).includes(role)) {
      throw AppError.badRequest("Invalid role");
    }

    // Check if user exists
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUpdate) {
      throw AppError.notFound("User not found");
    }

    // Prevent downgrading the last admin
    const userRole = (userToUpdate as unknown as UserWithRole).role;
    if (userRole === "ADMIN" && role !== UserRoleEnum.ADMIN) {
      // Find admin users using a raw query to avoid type issues
      const adminUsers = await prisma.$queryRaw`
      SELECT * FROM "users" WHERE "role" = 'ADMIN'
    `;

      if (Array.isArray(adminUsers) && adminUsers.length <= 1) {
        throw AppError.badRequest(
          "Cannot downgrade the last admin. Promote another user to admin first."
        );
      }
    }

    // Update user role using Prisma's update method instead of raw query
    // This handles the enum type conversion properly
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Get the updated user with selected fields
    const updatedUserBasic = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    res.json({
      ...updatedUserBasic,
      role: updatedUser.role,
    });
  }
);
