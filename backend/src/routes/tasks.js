import express from "express";
import {
  createTaskInProject,
  getAllProjectTasks,
  updateTaskDetails,
  advanceTaskStatus,
  removeTaskFromProject,
  getDashboardMetrics,
} from "../controllers/taskController.js";
import { authenticate } from "../middleware/auth.js";
import { wrapAsync } from "../middleware/errorHandling.js";

const router = express.Router();

router.use(authenticate);

// Dashboard stats - separate endpoint for clarity
router.get("/stats/dashboard", wrapAsync(getDashboardMetrics));

// Task CRUD operations
router.post("/:projectId", wrapAsync(createTaskInProject));
router.get("/:projectId", wrapAsync(getAllProjectTasks));
router.put("/:projectId/:taskId", wrapAsync(updateTaskDetails));
router.patch("/:projectId/:taskId/status", wrapAsync(advanceTaskStatus));
router.delete("/:projectId/:taskId", wrapAsync(removeTaskFromProject));

export default router;
