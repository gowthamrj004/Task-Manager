import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { projectAPI, taskAPI } from '../utils/api';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function ProjectBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    dueDate: '',
  });

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectAPI.getById(id),
        taskAPI.getAll(id),
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks ?? []);
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.create(id, taskData);
      setTaskData({ title: '', description: '', status: 'TODO', dueDate: '' });
      setShowNewTaskForm(false);
      loadProjectData();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.map((e) => e.issue).join(', ') ||
        'Failed to create task';
      alert(msg);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await taskAPI.updateStatus(id, taskId, newStatus);
      loadProjectData();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.map((e) => e.issue).join(', ') ||
        'Failed to update task';
      alert(msg);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure?')) return;
    try {
      await taskAPI.delete(id, taskId);
      loadProjectData();
    } catch (error) {
      alert('Failed to delete task');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await projectAPI.delete(id);
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to delete project');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen">Project not found</div>;
  }

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const doingTasks = tasks.filter((t) => t.status === 'DOING');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
              <p className="text-gray-600 text-sm">{project.description}</p>
            </div>
          </div>
          <button
            onClick={handleDeleteProject}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Delete Project
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Add Task Button */}
        {!showNewTaskForm && (
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition mb-8"
          >
            <Plus size={18} />
            New Task
          </button>
        )}

        {/* New Task Form */}
        {showNewTaskForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTaskForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Todo Column */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              To Do ({todoTasks.length})
            </h3>
            <div className="space-y-3">
              {todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={() => handleUpdateTaskStatus(task.id, 'DOING')}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))}
            </div>
          </div>

          {/* Doing Column */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              In Progress ({doingTasks.length})
            </h3>
            <div className="space-y-3">
              {doingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={() => handleUpdateTaskStatus(task.id, 'DONE')}
                  onRevert={() => handleUpdateTaskStatus(task.id, 'TODO')}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))}
            </div>
          </div>

          {/* Done Column */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Done ({doneTasks.length})
            </h3>
            <div className="space-y-3">
              {doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onRevert={() => handleUpdateTaskStatus(task.id, 'DOING')}
                  onDelete={() => handleDeleteTask(task.id)}
                  completed
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TaskCard({ task, onStatusChange, onRevert, onDelete, completed }) {
  return (
    <div className="bg-gray-50 p-3 rounded border border-gray-200 hover:shadow transition">
      <h4 className="font-semibold text-gray-800 text-sm">{task.title}</h4>
      {task.description && <p className="text-gray-600 text-xs mt-1">{task.description}</p>}
      {task.dueDate && (
        <p className="text-gray-500 text-xs mt-2">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
      <div className="flex gap-2 mt-3">
        {onStatusChange && (
          <button
            onClick={onStatusChange}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded transition"
          >
            Move →
          </button>
        )}
        {onRevert && (
          <button
            onClick={onRevert}
            className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded transition"
          >
            ← Back
          </button>
        )}
        <button
          onClick={onDelete}
          className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition ml-auto"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
