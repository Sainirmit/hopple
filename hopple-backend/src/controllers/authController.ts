import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../index";
import {
  UserLoginData,
  UserRegistrationData,
  AuthRequest,
  UserRoleEnum,
} from "../types";
import { generateToken } from "../utils/jwt";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";

// Define a type that includes the role property
interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  createdAt?: Date;
  [key: string]: any;
}

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, avatarUrl }: UserRegistrationData = req.body;

  // Check if user already exists
  const userExists = await prisma.user.findUnique({
    where: { email },
  });

  if (userExists) {
    throw AppError.badRequest("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Check if this is the first user - make them an admin
  const userCount = await prisma.user.count();
  const role = userCount === 0 ? UserRoleEnum.ADMIN : UserRoleEnum.USER;

  // Create user with type assertion
  const userData: any = {
    name,
    email,
    password: hashedPassword,
    avatarUrl,
    role,
  };

  const user = await prisma.user.create({
    data: userData,
  });

  if (user) {
    // Cast to UserWithRole
    const userWithRole = user as unknown as UserWithRole;

    res.status(201).json({
      id: userWithRole.id,
      name: userWithRole.name,
      email: userWithRole.email,
      avatarUrl: userWithRole.avatarUrl,
      role: userWithRole.role,
      token: generateToken(userWithRole.id),
    });
  } else {
    throw AppError.badRequest("Invalid user data");
  }
});

/**
 * Login a user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: UserLoginData = req.body;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw AppError.unauthorized("Invalid email or password");
  }

  // Check if password matches
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw AppError.unauthorized("Invalid email or password");
  }

  // Cast to UserWithRole
  const userWithRole = user as unknown as UserWithRole;

  res.json({
    id: userWithRole.id,
    name: userWithRole.name,
    email: userWithRole.email,
    avatarUrl: userWithRole.avatarUrl,
    role: userWithRole.role,
    token: generateToken(userWithRole.id),
  });
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized("Not authorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw AppError.notFound("User not found");
  }

  // Add role from req.user
  const userWithRole = {
    ...user,
    role: req.user.role,
  };

  res.json(userWithRole);
});
