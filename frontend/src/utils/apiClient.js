import axios from 'axios';

/**
 * API Client Configuration
 * Custom axios instance with application-specific defaults and interceptors
 * This approach allows for centralized API configuration and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - automatically includes auth token if available
 * Handles token refresh logic (can be extended in future)
 */
apiClient.interceptors.request.use(
  (config) => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - standardizes error handling across all API calls
 * Extracts meaningful error messages from various response formats
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    if (data && typeof data === 'object' && typeof data.message === 'string') {
      error.apiMessage = data.message;
    } else if (typeof data === 'string' && data.trim() && !data.trim().startsWith('<')) {
      try {
        const parsed = JSON.parse(data);
        if (parsed?.message) error.apiMessage = parsed.message;
      } catch {
        error.apiMessage = data.trim().slice(0, 500);
      }
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('accountData');
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API Functions
 * Handles user account lifecycle operations
 */
export const accountManagementAPI = {
  // Create new user account
  registerAccount: async (registrationData) => {
    const response = await apiClient.post('/auth/register', {
      email: registrationData.emailAddress,
      password: registrationData.rawPassword,
      fullName: registrationData.userFullName,
    });
    return response;
  },

  // Authenticate existing user
  loginAccount: async (credentials) => {
    const response = await apiClient.post('/auth/login', {
      email: credentials.emailAddress,
      password: credentials.rawPassword,
    });
    return response;
  },

  // End user session
  logoutAccount: async () => {
    const response = await apiClient.post('/auth/logout');
    return response;
  },

  // Retrieve current user profile
  fetchCurrentProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response;
  },
};

/**
 * Project Management API Functions
 * Handles all project-related operations
 */
export const projectManagementAPI = {
  // Create new project
  createProject: async (projectInfo) => {
    const response = await apiClient.post('/projects', {
      name: projectInfo.projectName,
      description: projectInfo.projectDescription,
    });
    return response;
  },

  // Retrieve all user's projects
  fetchAllProjects: async () => {
    const response = await apiClient.get('/projects');
    return response;
  },

  // Get single project with details
  fetchProjectDetails: async (projectId) => {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response;
  },

  // Update project information
  updateProjectInfo: async (projectId, updateData) => {
    const response = await apiClient.put(`/projects/${projectId}`, {
      name: updateData.projectName,
      description: updateData.projectDescription,
    });
    return response;
  },

  // Permanently delete project
  deleteProject: async (projectId) => {
    const response = await apiClient.delete(`/projects/${projectId}`);
    return response;
  },

  // Add team member to project
  addTeamMember: async (projectId, memberId) => {
    const response = await apiClient.post(`/projects/${projectId}/members`, {
      memberId,
    });
    return response;
  },
};

/**
 * Task Management API Functions
 * Handles all task-related operations within projects
 */
export const taskManagementAPI = {
  // Create task in project
  createTask: async (projectId, taskInfo) => {
    const response = await apiClient.post(`/tasks/${projectId}`, {
      title: taskInfo.taskTitle,
      description: taskInfo.taskDescription,
      status: taskInfo.initialStatus || 'TODO',
      dueDate: taskInfo.dueDate,
      assigneeId: taskInfo.assignedToUserId,
    });
    return response;
  },

  // Fetch all tasks in project
  fetchProjectTasks: async (projectId) => {
    const response = await apiClient.get(`/tasks/${projectId}`);
    return response;
  },

  // Update task details
  updateTask: async (projectId, taskId, updateData) => {
    const response = await apiClient.put(`/tasks/${projectId}/${taskId}`, {
      title: updateData.taskTitle,
      description: updateData.taskDescription,
      status: updateData.taskStatus,
      dueDate: updateData.dueDate,
      assigneeId: updateData.assignedToUserId,
    });
    return response;
  },

  // Change task status through workflow
  updateTaskStatus: async (projectId, taskId, newStatus) => {
    const response = await apiClient.patch(`/tasks/${projectId}/${taskId}/status`, {
      newStatus,
    });
    return response;
  },

  // Remove task from project
  removeTask: async (projectId, taskId) => {
    const response = await apiClient.delete(`/tasks/${projectId}/${taskId}`);
    return response;
  },

  // Fetch dashboard statistics
  fetchDashboardStats: async () => {
    const response = await apiClient.get('/tasks/stats/dashboard');
    return response;
  },
};

export default apiClient;
