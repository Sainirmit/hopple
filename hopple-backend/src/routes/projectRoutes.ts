import express from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController";
import {
  getProjectTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import {
  getSubtasks,
  getSubtaskById,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} from "../controllers/subtaskController";
import { protect, requireAdminOrManager } from "../middlewares/authMiddleware";

const router = express.Router();

// Apply authentication middleware to all project routes
router.use(protect);

// Base project routes
router.route("/").get(getProjects).post(createProject);

// Project-specific routes
router
  .route("/:id")
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

// Admin routes (only accessible by admin or manager)
router.route("/admin/all").get(requireAdminOrManager, getProjects);

// Task routes
router.route("/:projectId/tasks").get(getProjectTasks).post(createTask);

router
  .route("/:projectId/tasks/:taskId")
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

// Subtask routes
router
  .route("/:projectId/tasks/:taskId/subtasks")
  .get(getSubtasks)
  .post(createSubtask);

router
  .route("/:projectId/tasks/:taskId/subtasks/:subtaskId")
  .get(getSubtaskById)
  .put(updateSubtask)
  .delete(deleteSubtask);

export default router;
