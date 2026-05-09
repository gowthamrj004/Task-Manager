import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { projectAPI, taskAPI } from '../utils/api';
import { LogOut, Plus } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser: user, endUserSession: logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, statsRes] = await Promise.all([
        projectAPI.getAll(),
        taskAPI.getStats().catch(() => ({ data: {} })),
      ]);
      setProjects(projectsRes.data.projects ?? []);
      const s = statsRes.data.statistics;
      setStats(
        s
          ? {
              total: s.totalTaskCount,
              todo: s.todoCount,
              doing: s.inProgressCount,
              done: s.completedCount,
              overdue: s.overdueCount,
            }
          : null
      );
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.create({
        name: projectName,
        description: projectDesc,
      });
      setProjectName('');
      setProjectDesc('');
      setShowNewProjectForm(false);
      loadData();
    } catch (error) {
      alert('Failed to create project');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
            <p className="text-gray-600">Welcome, {user?.fullName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">To Do</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.todo || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.doing || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Done</p>
              <p className="text-2xl font-bold text-green-600">{stats.done || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue || 0}</p>
            </div>
          </div>
        )}

        {/* New Project Form */}
        {showNewProjectForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProjectForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create Button */}
        {!showNewProjectForm && (
          <button
            onClick={() => setShowNewProjectForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition mb-8"
          >
            <Plus size={18} />
            New Project
          </button>
        )}

        {/* Projects List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Projects</h2>
          {projects.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-600">No projects yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
                >
                  <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                  <p className="text-gray-600 text-sm mt-2">{project.description}</p>
                  <p className="text-gray-500 text-xs mt-4">
                    Tasks: {project.tasks?.length || 0}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
