import request from "supertest";
import express from "express";
import { PrismaClient } from "@prisma/client";
import authRoutes from "../../src/routes/authRoutes";
import { errorHandler } from "../../src/middlewares/errorHandler";
import bcrypt from "bcrypt";
import { UserRoleEnum } from "../../src/types";

// Mock Prisma
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock bcrypt
jest.mock("bcrypt", () => ({
  genSalt: jest.fn().mockResolvedValue("salt"),
  hash: jest.fn().mockResolvedValue("hashedPassword"),
  compare: jest.fn().mockResolvedValue(true),
}));

// Setup express app for testing
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(errorHandler);

// Get the mocked prisma client
const prisma = new PrismaClient();

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user and return user data with token", async () => {
      // Arrange
      const newUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      // Mock responses
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "test-id",
        ...newUser,
        password: "hashedPassword",
        role: UserRoleEnum.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const response = await request(app)
        .post("/api/auth/register")
        .send(newUser)
        .expect("Content-Type", /json/)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty("id", "test-id");
      expect(response.body).toHaveProperty("name", "Test User");
      expect(response.body).toHaveProperty("email", "test@example.com");
      expect(response.body).toHaveProperty("token");
      expect(response.body).not.toHaveProperty("password");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it("should return 400 if user already exists", async () => {
      // Arrange
      const existingUser = {
        name: "Existing User",
        email: "existing@example.com",
        password: "password123",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "existing-id",
        email: "existing@example.com",
      });

      // Act
      const response = await request(app)
        .post("/api/auth/register")
        .send(existingUser)
        .expect("Content-Type", /json/)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty("message", "User already exists");
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login a user and return user data with token", async () => {
      // Arrange
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "test-id",
        name: "Test User",
        email: "test@example.com",
        password: "hashedPassword",
        role: UserRoleEnum.USER,
      });

      // Act
      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect("Content-Type", /json/)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty("id", "test-id");
      expect(response.body).toHaveProperty("name", "Test User");
      expect(response.body).toHaveProperty("email", "test@example.com");
      expect(response.body).toHaveProperty("token");
      expect(response.body).not.toHaveProperty("password");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(bcrypt.compare).toHaveBeenCalled();
    });

    it("should return 401 if credentials are invalid", async () => {
      // Arrange
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "test-id",
        email: "test@example.com",
        password: "hashedPassword",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      // Act
      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect("Content-Type", /json/)
        .expect(401);

      // Assert
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password"
      );
    });
  });
});
