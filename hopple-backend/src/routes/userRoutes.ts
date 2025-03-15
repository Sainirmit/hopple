import express from "express";
import {
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  changeUserRole,
} from "../controllers/userController";
import { protect, requireAdmin } from "../middlewares/authMiddleware";

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(protect);

// Base routes
router.route("/").get(getUsers);

// User specific routes
router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

// Role management (admin only)
router.route("/:id/role").patch(requireAdmin, changeUserRole);

export default router;
