import { PrismaClient } from "@prisma/client";
import { Request } from "express";

// Get Prisma types from the generated client
const prisma = new PrismaClient();
type User = typeof prisma.user.fields;
type Project = typeof prisma.project.fields;
type Task = typeof prisma.task.fields;
type Subtask = typeof prisma.subtask.fields;
type ProjectMember = typeof prisma.projectMember.fields;
type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "COMPLETED";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type ProjectRole = "OWNER" | "ADMIN" | "MEMBER";

// Runtime enums (for use in code)
export enum ProjectRoleEnum {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum TaskStatusEnum {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum PriorityEnum {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum UserRoleEnum {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER",
}

// User types
export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRoleEnum;
}

// Project types
export interface ProjectCreateData {
  title: string;
  description?: string;
  dueDate: Date;
  members?: string[]; // Array of user IDs
}

export interface ProjectUpdateData {
  title?: string;
  description?: string;
  dueDate?: Date;
  progress?: number;
}

// Task types
export interface TaskCreateData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date;
  assigneeId?: string;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date;
  assigneeId?: string;
}

// Subtask types
export interface SubtaskCreateData {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface SubtaskUpdateData {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

// Request with authenticated user
export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Export types for use in the application
export {
  User,
  Project,
  Task,
  Subtask,
  ProjectMember,
  TaskStatus,
  Priority,
  ProjectRole,
};
