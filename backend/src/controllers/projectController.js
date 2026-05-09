import { validateData, projectSchema } from "../utils/validation.js";
import projectService from "../services/projectService.js";

/**
 * Create New Project Handler
 * Validates input and creates project owned by authenticated user
 */
export const createNewProject = async (req, res, next) => {
  try {
    const validatedInput = validateData(projectSchema, req.body);

    const newProject = await projectService.createProjectForOwner(
      req.user.id,
      {
        projectName: validatedInput.name,
        projectDescription: validatedInput.description,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve All User Projects
 * Returns all projects owned by the authenticated user
 */
export const fetchAllUserProjects = async (req, res, next) => {
  try {
    const userProjects = await projectService.fetchUserProjects(req.user.id);

    return res.status(200).json({
      success: true,
      count: userProjects.length,
      projects: userProjects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Project by ID
 * Retrieves detailed view of a single project with authorization check
 */
export const getProjectDetailsById = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const projectDetails = await projectService.fetchProjectDetails(
      projectId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      project: projectDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Project
 * Allows modification of project name and description
 */
export const updateProjectMetadata = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const validatedInput = validateData(projectSchema, req.body);

    const updatedProject = await projectService.modifyProjectDetails(
      projectId,
      req.user.id,
      {
        projectName: validatedInput.name,
        projectDescription: validatedInput.description,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Project
 * Removes project and cascades delete to associated tasks
 */
export const removeProjectAndRelated = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    await projectService.removeProject(projectId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Team Member to Project
 * Allows project owner to add collaborators
 */
export const addCollaboratorToProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { memberId } = req.body;

    const updatedProject = await projectService.addTeamMember(
      projectId,
      req.user.id,
      memberId
    );

    return res.status(200).json({
      success: true,
      message: "Team member added successfully",
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};
