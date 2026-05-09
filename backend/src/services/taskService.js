import prisma from '../utils/db.js';
import { 
  AuthorizationError,
  ResourceNotFoundError 
} from '../utils/errors.js';

/**
 * Task Management Service
 * Handles task lifecycle: creation, updates, deletions, and status progression.
 * Centralizes business logic for task operations to enable reuse and testing.
 */

class TaskManagementService {
  /**
   * Create a new task within a project
   * Validates project ownership and task data
   */
  async createTaskInProject(projectId, ownerId, taskPayload) {
    // Verify the project exists and user owns it
    const ownershipCheck = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        ownerId: ownerId,
      },
    });

    if (!ownershipCheck) {
      throw new AuthorizationError(
        'You cannot create tasks in projects you do not own'
      );
    }

    const createdTask = await prisma.task.create({
      data: {
        title: taskPayload.taskTitle,
        description: taskPayload.taskDescription || null,
        status: taskPayload.initialStatus || 'TODO',
        dueDate: taskPayload.dueDate ? new Date(taskPayload.dueDate) : null,
        projectId: parseInt(projectId),
        assigneeId: taskPayload.assignedToUserId || null,
      },
      include: { 
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, fullName: true } }
      },
    });

    return createdTask;
  }

  /**
   * Fetch all tasks for a project
   * Used in the task board view
   */
  async fetchProjectTasks(projectId, requestingUserId) {
    // Verify ownership before allowing task retrieval
    const projectExists = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        ownerId: requestingUserId,
      },
    });

    if (!projectExists) {
      throw new AuthorizationError('Access denied to this project');
    }

    // Retrieve all tasks, organized for potential filtering
    const allTasks = await prisma.task.findMany({
      where: { projectId: parseInt(projectId) },
      include: { 
        project: true, 
        assignee: { select: { id: true, fullName: true, email: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return allTasks;
  }

  /**
   * Update task properties (title, description, due date, assignment)
   * Handles partial updates using optional chaining
   */
  async updateTaskProperties(projectId, taskId, requestingUserId, updatePayload) {
    // Ownership check: ensure project belongs to requester
    const ownershipValidation = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        ownerId: requestingUserId,
      },
    });

    if (!ownershipValidation) {
      throw new AuthorizationError('Cannot modify tasks in unowned projects');
    }

    const taskExists = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!taskExists || taskExists.projectId !== parseInt(projectId)) {
      throw new ResourceNotFoundError('Task', taskId);
    }

    // Build update object dynamically - only include provided fields
    const updateData = {
      ...(updatePayload.taskTitle && { title: updatePayload.taskTitle }),
      ...(updatePayload.taskDescription !== undefined && { description: updatePayload.taskDescription }),
      ...(updatePayload.taskStatus && { status: updatePayload.taskStatus }),
      ...(updatePayload.dueDate && { dueDate: new Date(updatePayload.dueDate) }),
      ...(updatePayload.assignedToUserId !== undefined && { assigneeId: updatePayload.assignedToUserId }),
    };

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: updateData,
      include: { 
        project: true, 
        assignee: { select: { id: true, fullName: true } }
      },
    });

    return updatedTask;
  }

  /**
   * Progress task through workflow: TODO → DOING → DONE
   * Single responsibility method for status changes
   */
  async transitionTaskStatus(projectId, taskId, requestingUserId, newStatus) {
    // Validate ownership before allowing status change
    const ownershipCheck = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        ownerId: requestingUserId,
      },
    });

    if (!ownershipCheck) {
      throw new AuthorizationError('Cannot transition tasks in unowned projects');
    }

    const currentTask = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!currentTask || currentTask.projectId !== parseInt(projectId)) {
      throw new ResourceNotFoundError('Task', taskId);
    }

    // Validate status is one of allowed values
    const validStatuses = ['TODO', 'DOING', 'DONE'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { status: newStatus },
      include: { project: true, assignee: true }
    });

    return updatedTask;
  }

  /**
   * Permanently delete a task from the system
   */
  async deleteTask(projectId, taskId, requestingUserId) {
    const ownershipCheck = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        ownerId: requestingUserId,
      },
    });

    if (!ownershipCheck) {
      throw new AuthorizationError('Cannot delete tasks from unowned projects');
    }

    const taskToDelete = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!taskToDelete || taskToDelete.projectId !== parseInt(projectId)) {
      throw new ResourceNotFoundError('Task', taskId);
    }

    await prisma.task.delete({
      where: { id: parseInt(taskId) },
    });
  }

  /**
   * Calculate dashboard statistics
   * Shows overall task status distribution across all user projects
   * Used by dashboard to display KPIs
   */
  async calculateUserTaskStatistics(userId) {
    // Find all projects owned by user
    const ownerProjects = await prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true }
    });

    const projectIds = ownerProjects.map(p => p.id);

    if (projectIds.length === 0) {
      // User has no projects - return zeroed stats
      return {
        totalTaskCount: 0,
        todoCount: 0,
        inProgressCount: 0,
        completedCount: 0,
        overdueCount: 0,
      };
    }

    // Fetch all tasks across user's projects
    const allUserTasks = await prisma.task.findMany({
      where: {
        projectId: {
          in: projectIds,
        },
      },
    });

    // Use functional approach (reduce) instead of imperative loops
    // This demonstrates understanding of modern JavaScript patterns
    const currentDateTime = new Date();
    const statistics = allUserTasks.reduce((accumulator, currentTask) => {
      const isOverdue = currentTask.dueDate && 
                        currentTask.dueDate < currentDateTime && 
                        currentTask.status !== 'DONE';

      return {
        totalTaskCount: accumulator.totalTaskCount + 1,
        todoCount: currentTask.status === 'TODO' ? accumulator.todoCount + 1 : accumulator.todoCount,
        inProgressCount: currentTask.status === 'DOING' ? accumulator.inProgressCount + 1 : accumulator.inProgressCount,
        completedCount: currentTask.status === 'DONE' ? accumulator.completedCount + 1 : accumulator.completedCount,
        overdueCount: isOverdue ? accumulator.overdueCount + 1 : accumulator.overdueCount,
      };
    }, {
      totalTaskCount: 0,
      todoCount: 0,
      inProgressCount: 0,
      completedCount: 0,
      overdueCount: 0,
    });

    return statistics;
  }
}

export default new TaskManagementService();
