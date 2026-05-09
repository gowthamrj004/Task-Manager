import express from "express";
import {
  createNewProject,
  fetchAllUserProjects,
  getProjectDetailsById,
  updateProjectMetadata,
  removeProjectAndRelated,
  addCollaboratorToProject,
} from "../controllers/projectController.js";
import { authenticate } from "../middleware/auth.js";
import { wrapAsync } from "../middleware/errorHandling.js";

const router = express.Router();

router.use(authenticate);

router.post("/", wrapAsync(createNewProject));
router.get("/", wrapAsync(fetchAllUserProjects));
router.get("/:projectId", wrapAsync(getProjectDetailsById));
router.put("/:projectId", wrapAsync(updateProjectMetadata));
router.delete("/:projectId", wrapAsync(removeProjectAndRelated));
router.post("/:projectId/members", wrapAsync(addCollaboratorToProject));

export default router;
