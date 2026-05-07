import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Plus, Search, FolderKanban, Calendar, Loader2, Trash2, X, ChevronRight, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { cn } from '../lib/utils';

const STATUS_CONFIG = {
  active:    { label: 'Active',    cls: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25' },
  completed: { label: 'Completed', cls: 'bg-indigo-500/15  text-indigo-500  border-indigo-500/25'  },
  archived:  { label: 'Archived',  cls: 'bg-muted text-muted-foreground border-border'    },
};

/* ── Create modal ──────────────────────────────────────────────────── */
const CreateProjectModal = ({ onClose, onCreated }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { color: 'hsl(var(--primary))' } });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await projectService.create(data);
      toast.success('Project created!');
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-foreground text-xl font-bold tracking-tight">New Project</h2>
            <p className="text-muted-foreground text-sm mt-1">Create a new workspace for your team</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-foreground">Project Title <span className="text-destructive">*</span></label>
            <input
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g. Website Redesign"
              className={cn(
                "flex h-10 w-full rounded-xl border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1",
                errors.title ? "border-destructive focus-visible:ring-destructive" : "border-border focus-visible:border-primary focus-visible:ring-primary"
              )}
            />
            {errors.title && <p className="text-[0.8rem] font-medium text-destructive mt-1">⚠ {errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-foreground">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="What is this project about?"
              className="flex w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Deadline</label>
              <input
                type="date"
                {...register('deadline')}
                className="flex h-10 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Theme Color</label>
              <div className="flex items-center gap-3 h-10">
                <input
                  type="color"
                  {...register('color')}
                  className="w-8 h-8 rounded-full border-0 p-0 bg-transparent cursor-pointer overflow-hidden shadow-sm"
                />
                <span className="text-muted-foreground text-sm">Select color</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 h-10 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ── Project card ──────────────────────────────────────────────────── */
const ProjectCard = ({ project, isAdmin, onDelete }) => {
  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Top color accent */}
      <div className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: project.color || 'hsl(var(--primary))' }}
      />

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10"
          style={{ backgroundColor: `${project.color || 'hsl(var(--primary))'}15` }}>
          <FolderKanban size={20} style={{ color: project.color || 'hsl(var(--primary))' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-foreground font-semibold text-base leading-snug truncate group-hover:text-primary transition-colors">{project.title}</h3>
            {isAdmin && (
              <button
                onClick={(e) => { e.preventDefault(); onDelete(project._id); }}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <span className={cn("inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1.5 uppercase tracking-wider", status.cls)}>
            {status.label}
          </span>
        </div>
      </div>

      {project.description ? (
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-6 flex-1">{project.description}</p>
      ) : (
         <div className="mb-6 flex-1" />
      )}

      {/* Progress */}
      <div className="mb-5 mt-auto">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-medium">{project.completedCount || 0} / {project.taskCount || 0} tasks completed</span>
          <span className="font-bold" style={{ color: project.color || 'hsl(var(--primary))' }}>{project.progress || 0}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress || 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: project.color || 'hsl(var(--primary))' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          {/* Member avatars */}
          {project.members?.length > 0 ? (
            <div className="flex -space-x-2">
              {project.members?.slice(0, 3).map((m, i) => (
                <div key={i}
                  className="w-7 h-7 rounded-full border-2 border-card bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold"
                  title={m.name}
                >
                  {m.name?.[0]?.toUpperCase()}
                </div>
              ))}
              {project.members?.length > 3 && (
                <div className="w-7 h-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-muted-foreground text-[10px] font-bold">
                  +{project.members.length - 3}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Users size={14} /> No members
            </div>
          )}
          {project.deadline && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calendar size={14} />
              {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
        <Link
          to={`/projects/${project._id}`}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          Open <ChevronRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

/* ── Projects page ─────────────────────────────────────────────────── */
const ProjectsPage = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    projectService.getAll()
      .then(res => setProjects(res.data.data || []))
      .catch(() => toast.error('Failed to load projects.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await projectService.remove(id);
      setProjects(p => p.filter(pr => pr._id !== id));
      toast.success('Project deleted.');
    } catch { toast.error('Delete failed.'); }
  };

  const filtered = projects.filter(p => {
    const ms = p.title.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === 'all' || p.status === statusFilter;
    return ms && mf;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-screen-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Projects</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {loading ? 'Loading...' : `Manage your ${projects.length} workspace${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-sm font-medium transition-all shadow-sm"
            >
              <Plus size={18} /> New Project
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-card border border-border p-2 rounded-2xl shadow-sm">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none text-foreground text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
            />
          </div>
          <div className="h-px sm:w-px sm:h-auto bg-border mx-2" />
          <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['all', 'active', 'completed', 'archived'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize whitespace-nowrap",
                  statusFilter === s
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {s === 'all' ? 'All Projects' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 rounded-2xl bg-card border border-border animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-card border border-border rounded-3xl border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6">
              <FolderKanban size={32} className="text-muted-foreground" />
            </div>
            <p className="text-foreground text-xl font-semibold tracking-tight mb-2">No projects found</p>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              {search || statusFilter !== 'all' ? "We couldn't find any projects matching your current filters." : "You haven't created any projects yet. Get started by creating your first workspace."}
            </p>
            {isAdmin && !search && statusFilter === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all shadow-sm"
              >
                <Plus size={18} /> Create First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map(p => (
                <ProjectCard key={p._id} project={p} isAdmin={isAdmin} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <CreateProjectModal
            onClose={() => setShowModal(false)}
            onCreated={proj => setProjects(prev => [proj, ...prev])}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default ProjectsPage;
