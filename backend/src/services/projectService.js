import prisma from '../utils/db.js';
import { 
  ValidationError,
  AuthorizationError,
  ResourceNotFoundError 
} from '../utils/errors.js';

/**
 * Project Management Service
 * Encapsulates all business logic for project operations.
 * This separation allows reuse across different endpoint implementations
 * and makes testing individual business rules easier.
 */

class ProjectManagementService {
  /**
   * Create a new project owned by a specific user
   * Validates input and establishes project ownership
   */
  async createProjectForOwner(ownerId, { projectName, projectDescription }) {
    const newProject = await prisma.project.create({
      data: {
        name: projectName,
        description: projectDescription || null,
        ownerId: ownerId,
      },
      include: { owner: true },
    });

    return newProject;
  }

  /**
   * Retrieve all projects owned by a user
   */
  async fetchUserProjects(userId) {
    const userProjects = await prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      include: { 
        owner: { select: { id: true, fullName: true, email: true } },
        tasks: true,
        members: { select: { id: true, fullName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return userProjects;
  }

  /**
   * Get a single project with full details
   * Includes authorization check
   */
  async fetchProjectDetails(projectId, requestingUserId) {
    const projectRecord = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: { 
        owner: true, 
        tasks: { orderBy: { createdAt: 'desc' } },
        members: true 
      },
    });

    if (!projectRecord) {
      throw new ResourceNotFoundError('Project', projectId);
    }

    // Only the owner can access this endpoint - enforce strict permissions
    if (projectRecord.ownerId !== requestingUserId) {
      throw new AuthorizationError(
        'Only the project owner can view detailed project information'
      );
    }

    return projectRecord;
  }

  /**
   * Update project metadata
   * Authorization: only owner can modify
   */
  async modifyProjectDetails(projectId, requestingUserId, { projectName, projectDescription }) {
    const projectRecord = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!projectRecord) {
      throw new ResourceNotFoundError('Project', projectId);
    }

    // Enforce ownership - prevent unauthorized modifications
    if (projectRecord.ownerId !== requestingUserId) {
      throw new AuthorizationError('Only the project owner can modify this project');
    }

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(projectId) },
      data: {
        ...(projectName && { name: projectName }),
        ...(projectDescription !== undefined && { description: projectDescription }),
      },
      include: { owner: true },
    });

    return updatedProject;
  }

  /**
   * Permanently delete a project
   * Cascading delete handles associated tasks
   */
  async removeProject(projectId, requestingUserId) {
    const projectRecord = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!projectRecord) {
      throw new ResourceNotFoundError('Project', projectId);
    }

    if (projectRecord.ownerId !== requestingUserId) {
      throw new AuthorizationError(
        'Only the project owner can delete this project'
      );
    }

    // Cascade delete via Prisma ensures all related tasks are cleaned up
    await prisma.project.delete({
      where: { id: parseInt(projectId) },
    });
  }

  /**
   * Add a team member to a project
   * Allows collaboration on shared projects
   */
  async addTeamMember(projectId, requestingUserId, teamMemberId) {
    const projectRecord = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });

    if (!projectRecord) {
      throw new ResourceNotFoundError('Project', projectId);
    }

    if (projectRecord.ownerId !== requestingUserId) {
      throw new AuthorizationError('Only the owner can add team members');
    }

    // Verify the member to add actually exists
    const memberToAdd = await prisma.user.findUnique({
      where: { id: teamMemberId },
    });

    if (!memberToAdd) {
      throw new ResourceNotFoundError('User', teamMemberId);
    }

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(projectId) },
      data: {
        members: {
          connect: { id: teamMemberId },
        },
      },
      include: { members: true },
    });

    return updatedProject;
  }
}

export default new ProjectManagementService();
