import { validateData, taskSchema, taskStatusPatchSchema } from "../utils/validation.js";
import taskService from "../services/taskService.js";

/**
 * Create New Task Handler
 * Validates input and creates task within a project
 */
export const createTaskInProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const validatedInput = validateData(taskSchema, req.body);

    const newTask = await taskService.createTaskInProject(
      projectId,
      req.user.id,
      {
        taskTitle: validatedInput.title,
        taskDescription: validatedInput.description,
        initialStatus: validatedInput.status || 'TODO',
        dueDate: validatedInput.dueDate,
        assignedToUserId: validatedInput.assigneeId,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve All Tasks for Project
 * Fetches all tasks with included relationships
 */
export const getAllProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const projectTasks = await taskService.fetchProjectTasks(
      projectId,
      req.user.id
    );

    // Group tasks by status for convenience - useful for Kanban boards
    const tasksByStatus = {
      TODO: projectTasks.filter(t => t.status === 'TODO'),
      DOING: projectTasks.filter(t => t.status === 'DOING'),
      DONE: projectTasks.filter(t => t.status === 'DONE'),
    };

    return res.status(200).json({
      success: true,
      count: projectTasks.length,
      tasks: projectTasks,
      groupedByStatus: tasksByStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Task Properties
 * Allows modification of task metadata and status
 */
export const updateTaskDetails = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const validatedInput = validateData(taskSchema, req.body);

    const updatedTask = await taskService.updateTaskProperties(
      projectId,
      taskId,
      req.user.id,
      {
        taskTitle: validatedInput.title,
        taskDescription: validatedInput.description,
        taskStatus: validatedInput.status,
        dueDate: validatedInput.dueDate,
        assignedToUserId: validatedInput.assigneeId,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Progress Task in Workflow
 * Convenience method for moving task through statuses (TODO → DOING → DONE)
 */
export const advanceTaskStatus = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const { newStatus } = validateData(taskStatusPatchSchema, req.body);

    const updatedTask = await taskService.transitionTaskStatus(
      projectId,
      taskId,
      req.user.id,
      newStatus
    );

    return res.status(200).json({
      success: true,
      message: `Task status changed to ${newStatus}`,
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Task
 * Permanently removes task from project
 */
export const removeTaskFromProject = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;

    await taskService.deleteTask(projectId, taskId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Dashboard Statistics
 * Calculates aggregated metrics for user dashboard
 * Shows overview of all tasks across all user projects
 */
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const userStatistics = await taskService.calculateUserTaskStatistics(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      statistics: userStatistics,
      // Include trend indicators for future enhancements
      metadata: {
        generatedAt: new Date().toISOString(),
        userId: req.user.id,
      },
    });
  } catch (error) {
    next(error);
  }
};
