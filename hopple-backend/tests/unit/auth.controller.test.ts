import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { register, login } from "../../src/controllers/authController";
import { prisma } from "../../src/index";
import { UserRoleEnum } from "../../src/types";
import * as jwtUtils from "../../src/utils/jwt";

// Mock dependencies
jest.mock("../../src/index", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock("bcrypt", () => ({
  genSalt: jest.fn().mockResolvedValue("salt"),
  hash: jest.fn().mockResolvedValue("hashedPassword"),
  compare: jest.fn(),
}));

jest.mock("../../src/utils/jwt", () => ({
  generateToken: jest.fn().mockReturnValue("test-token"),
}));

describe("Auth Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const next = jest.fn();

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      // Arrange
      req.body = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "user-id",
        name: "Test User",
        email: "test@example.com",
        role: UserRoleEnum.ADMIN,
        avatarUrl: null,
      });

      // Act
      await register(req as Request, res as Response, next);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", "salt");
      expect(prisma.user.create).toHaveBeenCalled();
      expect(jwtUtils.generateToken).toHaveBeenCalledWith("user-id");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "user-id",
          name: "Test User",
          email: "test@example.com",
          token: "test-token",
        })
      );
    });

    it("should return error if user already exists", async () => {
      // Arrange
      req.body = {
        name: "Test User",
        email: "existing@example.com",
        password: "password123",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "existing-id",
        email: "existing@example.com",
      });

      // Act & Assert
      await expect(
        register(req as Request, res as Response, next)
      ).rejects.toThrow("User already exists");

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should login a user with valid credentials", async () => {
      // Arrange
      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
        name: "Test User",
        email: "test@example.com",
        password: "hashedPassword",
        role: UserRoleEnum.USER,
        avatarUrl: null,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      await login(req as Request, res as Response, next);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword"
      );
      expect(jwtUtils.generateToken).toHaveBeenCalledWith("user-id");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "user-id",
          name: "Test User",
          email: "test@example.com",
          token: "test-token",
        })
      );
    });

    it("should return error if user not found", async () => {
      // Arrange
      req.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        login(req as Request, res as Response, next)
      ).rejects.toThrow("Invalid email or password");
    });

    it("should return error if password is incorrect", async () => {
      // Arrange
      req.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-id",
        email: "test@example.com",
        password: "hashedPassword",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        login(req as Request, res as Response, next)
      ).rejects.toThrow("Invalid email or password");
    });
  });
});
