import express from "express";
import { register, login, getMe } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import asyncHandler from "../utils/asyncHandler";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);

export default router;
