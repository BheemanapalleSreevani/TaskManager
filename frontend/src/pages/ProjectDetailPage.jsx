import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Plus, ArrowLeft, UserPlus, X, Loader2, Calendar, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { adminService } from '../services/adminService';

const priorityColors = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const TaskCard = ({ task, isAdmin, onStatusChange, onDelete }) => {
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await taskService.update(task._id, { status: newStatus });
      onStatusChange(task._id, newStatus);
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-gray-800/80 border border-white/10 rounded-xl p-4 group"
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {isAdmin && (
          <button onClick={() => onDelete(task._id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
            <X size={14} />
          </button>
        )}
      </div>
      <h4 className="text-white text-sm font-semibold mb-1">{task.title}</h4>
      {task.description && <p className="text-gray-400 text-xs mb-3 line-clamp-2">{task.description}</p>}

      <div className="flex items-center justify-between">
        {task.assignedTo && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
              {task.assignedTo.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-gray-400 text-xs">{task.assignedTo.name}</span>
          </div>
        )}
        {task.dueDate && (
          <span className={`text-xs ${new Date(task.dueDate) < new Date() ? 'text-red-400' : 'text-gray-500'}`}>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Status buttons */}
      <div className="flex gap-1 mt-3">
        {['todo', 'in-progress', 'done'].map(s => (
          <button
            key={s}
            disabled={updating || task.status === s}
            onClick={() => handleStatus(s)}
            className={`flex-1 text-[11px] py-1.5 px-1 rounded-lg transition-colors capitalize truncate font-medium ${
              task.status === s
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
            }`}
          >
            {s === 'in-progress' ? 'In Progress' : s}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const KanbanColumn = ({ title, tasks, color, isAdmin, onStatusChange, onDelete }) => (
  <div className="flex-1 min-w-72">
    <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-xl ${color}`}>
      <span className="text-sm font-semibold">{title}</span>
      <span className="ml-auto text-xs opacity-70">{tasks.length}</span>
    </div>
    <div className="space-y-3 min-h-24">
      <AnimatePresence>
        {tasks.map(t => (
          <TaskCard key={t._id} task={t} isAdmin={isAdmin} onStatusChange={onStatusChange} onDelete={onDelete} />
        ))}
      </AnimatePresence>
    </div>
  </div>
);

const CreateTaskModal = ({ projectId, members, onClose, onCreated }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await taskService.create({ ...data, project: projectId });
      toast.success('Task created!');
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">Create Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Task Title *</label>
            <input
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g. Design homepage"
              className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Task details..."
              className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Assign To</label>
              <select {...register('assignedTo')} className="w-full px-3 py-3 bg-gray-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Unassigned</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Priority</label>
              <select {...register('priority')} className="w-full px-3 py-3 bg-gray-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Due Date</label>
            <input type="date" {...register('dueDate')} className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create Task
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    projectService.getById(id)
      .then(res => {
        setProject(res.data.data);
        setTasks(res.data.data.tasks || []);
      })
      .catch(() => { toast.error('Project not found.'); navigate('/projects'); })
      .finally(() => setLoading(false));

    if (isAdmin) {
      adminService.getUsers()
        .then(res => setAllUsers(res.data.data || []))
        .catch(() => {});
    }
  }, [id, isAdmin]);

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.remove(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted.');
    } catch {
      toast.error('Delete failed.');
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;
    setAddingMember(true);
    try {
      const res = await projectService.addMember(id, selectedUser);
      setProject(res.data.data);
      setSelectedUser('');
      toast.success('Member added.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await projectService.removeMember(id, userId);
      setProject(p => ({ ...p, members: p.members.filter(m => m._id !== userId) }));
      toast.success('Member removed.');
    } catch {
      toast.error('Failed to remove member.');
    }
  };

  if (loading) {
    return <DashboardLayout><div className="flex justify-center h-48 items-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;
  }

  if (!project) return null;

  const columns = [
    { key: 'todo', title: 'To Do', color: 'bg-gray-800 text-gray-300' },
    { key: 'in-progress', title: 'In Progress', color: 'bg-amber-500/20 text-amber-300' },
    { key: 'done', title: 'Done', color: 'bg-emerald-500/20 text-emerald-300' },
  ];

  const nonMembers = allUsers.filter(u => !project.members?.some(m => m._id === u._id));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Projects
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color || '#6366f1' }} />
              <h1 className="text-3xl font-bold text-white">{project.title}</h1>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-medium text-sm transition-colors"
              >
                <Plus size={16} /> Add Task
              </button>
            )}
          </div>
          {project.description && <p className="text-gray-400 mt-2">{project.description}</p>}

          {/* Progress */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1 max-w-sm">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>{project.completedCount || tasks.filter(t => t.status === 'done').length}/{project.taskCount || tasks.length} tasks</span>
                <span>{project.progress !== undefined ? project.progress : Math.round((tasks.filter(t => t.status === 'done').length / Math.max(tasks.length, 1)) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round((tasks.filter(t => t.status === 'done').length / Math.max(tasks.length, 1)) * 100)}%`,
                    backgroundColor: project.color || '#6366f1',
                  }}
                />
              </div>
            </div>
            {project.deadline && (
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Calendar size={14} />
                {new Date(project.deadline).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Members section */}
        <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users size={18} className="text-indigo-400" /> Team Members ({project.members?.length || 0})
          </h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {project.members?.map(m => (
              <div key={m._id} className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {m.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{m.name}</p>
                  <p className="text-gray-400 text-xs">{m.role}</p>
                </div>
                {isAdmin && m._id !== project.createdBy?._id && (
                  <button onClick={() => handleRemoveMember(m._id)} className="text-gray-600 hover:text-red-400 ml-1">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isAdmin && nonMembers.length > 0 && (
            <div className="flex gap-3">
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select user to add</option>
                {nonMembers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
              </select>
              <button
                onClick={handleAddMember}
                disabled={!selectedUser || addingMember}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl text-white text-sm font-medium transition-colors"
              >
                {addingMember ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Add
              </button>
            </div>
          )}
        </div>

        {/* Kanban Board */}
        <div>
          <h2 className="text-white font-semibold mb-4">Task Board</h2>
          <div className="flex gap-5 overflow-x-auto pb-4">
            {columns.map(col => (
              <KanbanColumn
                key={col.key}
                title={col.title}
                color={col.color}
                tasks={tasks.filter(t => t.status === col.key)}
                isAdmin={isAdmin}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTaskModal && (
          <CreateTaskModal
            projectId={id}
            members={project.members || []}
            onClose={() => setShowTaskModal(false)}
            onCreated={task => setTasks(prev => [task, ...prev])}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default ProjectDetailPage;
