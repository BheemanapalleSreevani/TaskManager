import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Search, Trash2, CheckCircle2, Clock, ListTodo,
  AlertTriangle, ChevronDown, Calendar, FolderKanban
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { socket } from '../lib/socket';
import { cn } from '../lib/utils';

const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: ListTodo, color: 'hsl(var(--primary))' },
  { id: 'in-progress', title: 'In Progress', icon: Clock, color: 'hsl(var(--warning, 38 92% 50%))' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'hsl(var(--success, 142 71% 45%))' }
];

const PRIORITY_CFG = {
  high:   { cls: 'bg-destructive/10 text-destructive border-destructive/20', label: 'High' },
  medium: { cls: 'bg-orange-500/10 text-orange-500 border-orange-500/20',    label: 'Medium' },
  low:    { cls: 'bg-primary/10 text-primary border-primary/20',             label: 'Low' },
};

const TasksPage = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [prioFilter, setPrioFilter] = useState('');
  const [projFilter, setProjFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Initial Fetch
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (prioFilter)   params.priority = prioFilter;
      if (projFilter)   params.project  = projFilter;
      if (overdueOnly)  params.overdue  = 'true';
      if (search)       params.search   = search;
      const res = await taskService.getAll(params);
      setTasks(res.data.data || []);
    } catch { toast.error('Failed to load tasks.'); }
    finally  { setLoading(false); }
  };

  useEffect(() => {
    projectService.getAll().then(r => setProjects(r.data.data || []));
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchTasks, 350);
    return () => clearTimeout(t);
  }, [search, prioFilter, projFilter, overdueOnly]);

  // Real-time socket sync
  useEffect(() => {
    if (projects.length === 0) return;
    
    socket.connect();
    projects.forEach(p => socket.emit('joinProject', p._id));

    const handleTaskUpdated = (updatedTask) => {
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    };
    const handleTaskCreated = (newTask) => {
      setTasks(prev => prev.some(t => t._id === newTask._id) ? prev : [...prev, newTask]);
    };
    const handleTaskDeleted = (taskId) => {
      setTasks(prev => prev.filter(t => t._id !== taskId));
    };

    socket.on('TASK_UPDATED', handleTaskUpdated);
    socket.on('TASK_CREATED', handleTaskCreated);
    socket.on('TASK_DELETED', handleTaskDeleted);

    return () => {
      socket.off('TASK_UPDATED', handleTaskUpdated);
      socket.off('TASK_CREATED', handleTaskCreated);
      socket.off('TASK_DELETED', handleTaskDeleted);
      projects.forEach(p => socket.emit('leaveProject', p._id));
      socket.disconnect();
    };
  }, [projects]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.remove(id);
      setTasks(p => p.filter(t => t._id !== id));
      toast.success('Task deleted.');
    } catch { toast.error('Delete failed.'); }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list or no change
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistic UI update
    const newStatus = destination.droppableId;
    setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t));

    try {
      await taskService.update(draggableId, { status: newStatus });
    } catch {
      toast.error('Failed to update task status.');
      // Revert on failure (we would ideally need the old task state, but refetching is safer)
      fetchTasks();
    }
  };

  const tasksByStatus = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = tasks.filter(t => t.status === col.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort newest first
      return acc;
    }, {});
  }, [tasks]);

  const overdueCt = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Board</h1>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              {overdueCt > 0 && <span className="text-destructive font-medium flex items-center gap-1"><AlertTriangle size={14}/> {overdueCt} overdue</span>}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 bg-card border border-border p-2 rounded-2xl shadow-sm shrink-0">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 bg-transparent border-none text-foreground text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="hidden sm:block w-px bg-border my-1" />

          {/* Project Filter */}
          <div className="relative">
            <select
              value={projFilter}
              onChange={e => setProjFilter(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2 bg-transparent text-foreground text-sm focus:outline-none font-medium cursor-pointer"
            >
              <option value="" className="bg-card">All Projects</option>
              {projects.map(p => <option key={p._id} value={p._id} className="bg-card">{p.title}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={prioFilter}
              onChange={e => setPrioFilter(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2 bg-transparent text-foreground text-sm focus:outline-none font-medium cursor-pointer"
            >
              <option value="" className="bg-card">All Priorities</option>
              <option value="high" className="bg-card text-destructive">High</option>
              <option value="medium" className="bg-card text-orange-500">Medium</option>
              <option value="low" className="bg-card text-primary">Low</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {/* Overdue toggle */}
          <button
            onClick={() => setOverdueOnly(p => !p)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ml-auto",
              overdueOnly
                ? "bg-destructive text-destructive-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <AlertTriangle size={14} />
            <span className="hidden sm:inline">Overdue</span>
          </button>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-secondary/30 border border-border/50 rounded-2xl p-4 animate-pulse flex flex-col gap-3">
                <div className="h-6 bg-card rounded w-1/3 mb-2" />
                <div className="h-28 bg-card rounded-xl" />
                <div className="h-32 bg-card rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start min-h-[500px] overflow-x-auto pb-4">
              {COLUMNS.map(col => (
                <div key={col.id} className="flex flex-col min-w-[300px] h-full">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <col.icon size={18} style={{ color: col.color }} />
                    <h3 className="text-foreground font-semibold tracking-tight">{col.title}</h3>
                    <span className="bg-secondary text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full ml-auto">
                      {tasksByStatus[col.id]?.length || 0}
                    </span>
                  </div>
                  
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={cn(
                          "flex-1 bg-secondary/30 border border-border/50 rounded-2xl p-3 min-h-[150px] transition-colors flex flex-col gap-3",
                          snapshot.isDraggingOver && "bg-secondary/60 border-primary/30"
                        )}
                      >
                        <AnimatePresence>
                          {tasksByStatus[col.id]?.map((task, index) => {
                            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
                            const pcfg = PRIORITY_CFG[task.priority] || PRIORITY_CFG.low;
                            
                            return (
                              <Draggable key={task._id} draggableId={task._id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={cn(
                                      "bg-card border border-border rounded-xl p-4 shadow-sm select-none group relative",
                                      snapshot.isDragging && "shadow-xl border-primary/50 z-50 scale-[1.02] rotate-1"
                                    )}
                                    style={provided.draggableProps.style}
                                  >
                                    {/* Task Card Content */}
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border", pcfg.cls)}>
                                        {pcfg.label}
                                      </span>
                                      
                                      {isAdmin && (
                                        <button
                                          onClick={() => handleDelete(task._id)}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/10"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                    
                                    <h4 className="text-foreground font-semibold text-sm mb-1.5 leading-snug">{task.title}</h4>
                                    
                                    {task.description && (
                                      <p className="text-muted-foreground text-xs line-clamp-2 mb-4 leading-relaxed">
                                        {task.description}
                                      </p>
                                    )}
                                    
                                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                      {task.project && (
                                        <div className="flex items-center gap-1.5 max-w-[50%]" title={task.project.title}>
                                          <FolderKanban size={12} className="text-primary flex-shrink-0" />
                                          <span className="truncate">{task.project.title}</span>
                                        </div>
                                      )}
                                      
                                      {task.dueDate && (
                                        <div className={cn("flex items-center gap-1.5 ml-auto", isOverdue && "text-destructive font-medium")}>
                                          {isOverdue ? <AlertTriangle size={12} /> : <Calendar size={12} />}
                                          <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Assigned To Avatar (if exists) */}
                                    {task.assignedTo && (
                                      <div className="absolute top-4 right-4" title={`Assigned to ${task.assignedTo.name}`}>
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[9px] font-bold border-2 border-card shadow-sm">
                                          {task.assignedTo.name?.[0]?.toUpperCase()}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                        </AnimatePresence>
                        {provided.placeholder}
                        
                        {tasksByStatus[col.id]?.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center h-24 text-muted-foreground text-xs border-2 border-dashed border-border/50 rounded-xl m-1">
                            Drop tasks here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TasksPage;
