import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  CheckCircle2, Clock, AlertTriangle, ListTodo,
  FolderKanban, TrendingUp, Flame, Calendar, ArrowUpRight,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { toast } from 'react-toastify';
import { cn } from '../lib/utils';

/* ── Stat card ─────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, gradient, sub, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07 }}
    whileHover={{ y: -3, scale: 1.01 }}
    className={cn(
      "relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 shadow-sm hover:shadow-md"
    )}
  >
    {/* Background gradient blob */}
    <div className={cn("absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br opacity-10 blur-2xl", gradient)} />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-3">{label}</p>
        <p className="text-foreground text-3xl font-black">{value ?? <span className="text-muted-foreground">—</span>}</p>
        {sub && <p className="text-muted-foreground text-xs mt-1">{sub}</p>}
      </div>
      <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0", gradient)}>
        <Icon size={19} className="text-white" />
      </div>
    </div>
  </motion.div>
);

/* ── Custom tooltip ────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-2.5 shadow-2xl text-sm z-50">
      {label && <p className="text-muted-foreground mb-1 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.fill || p.color || 'hsl(var(--foreground))' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          taskService.getAll(),
          projectService.getAll(),
        ]);
        setMyTasks(tasksRes.data.data || []);
        setProjects(projectsRes.data.data || []);
        if (isAdmin) {
          const ar = await adminService.getAnalytics();
          setAnalytics(ar.data.data);
        }
      } catch { toast.error('Failed to load dashboard.'); }
      finally   { setLoading(false); }
    };
    fetchData();
  }, [isAdmin]);

  const done       = myTasks.filter(t => t.status === 'done');
  const inProg     = myTasks.filter(t => t.status === 'in-progress');
  const overdue    = myTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done');
  const upcoming   = myTasks
    .filter(t => t.dueDate && new Date(t.dueDate) > new Date() && t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const ov = analytics?.overview || {};

  const statCards = isAdmin && ov.totalTasks !== undefined
    ? [
      { icon: FolderKanban, label: 'Total Projects',  value: ov.totalProjects,   gradient: 'from-primary to-indigo-600' },
      { icon: ListTodo,     label: 'Total Tasks',     value: ov.totalTasks,      gradient: 'from-violet-500 to-purple-600' },
      { icon: CheckCircle2, label: 'Completed',       value: ov.completedTasks,  gradient: 'from-emerald-500 to-teal-600', sub: `${ov.completionRate}% completion rate` },
      { icon: AlertTriangle,label: 'Overdue',         value: ov.overdueTasks,    gradient: 'from-red-500 to-rose-600' },
    ]
    : [
      { icon: ListTodo,     label: 'My Tasks',    value: myTasks.length, gradient: 'from-primary to-indigo-600' },
      { icon: CheckCircle2, label: 'Completed',   value: done.length,    gradient: 'from-emerald-500 to-teal-600' },
      { icon: Clock,        label: 'In Progress', value: inProg.length,  gradient: 'from-amber-500 to-orange-600' },
      { icon: AlertTriangle,label: 'Overdue',     value: overdue.length, gradient: 'from-red-500 to-rose-600' },
    ];

  // Modern SaaS color palette for charts
  const statusColors = {
    todo: 'hsl(var(--primary))',
    inProgress: 'hsl(var(--warning, 38 92% 50%))',
    done: 'hsl(var(--success, 142 71% 45%))'
  };

  const priorityColors = {
    high: 'hsl(var(--destructive))',
    medium: 'hsl(var(--warning, 38 92% 50%))',
    low: 'hsl(var(--primary))'
  };

  const statusData = [
    { name: 'Todo',        value: myTasks.filter(t => t.status === 'todo').length,        fill: statusColors.todo },
    { name: 'In Progress', value: inProg.length,                                          fill: statusColors.inProgress },
    { name: 'Done',        value: done.length,                                            fill: statusColors.done },
  ];
  const priorityData = [
    { name: 'High',   value: myTasks.filter(t => t.priority === 'high').length,   fill: priorityColors.high },
    { name: 'Medium', value: myTasks.filter(t => t.priority === 'medium').length, fill: priorityColors.medium },
    { name: 'Low',    value: myTasks.filter(t => t.priority === 'low').length,    fill: priorityColors.low },
  ];

  const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  return (
    <DashboardLayout>
      <div className="space-y-7 max-w-screen-2xl mx-auto w-full">

        {/* ── Header ─────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {greet()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your projects today.</p>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((c, i) => <StatCard key={i} {...c} index={i} />)}
          </div>
        )}

        {/* ── Charts ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Status chart */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} className="text-primary" />
              <h2 className="text-foreground font-semibold text-sm">Task Status</h2>
            </div>
            {statusData.every(d => d.value === 0) ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No tasks yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={statusData} barSize={36}>
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} width={25} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Priority pie */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Flame size={16} className="text-orange-500" />
              <h2 className="text-foreground font-semibold text-sm">Tasks by Priority</h2>
            </div>
            {priorityData.every(d => d.value === 0) ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No tasks yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4} stroke="none">
                    {priorityData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    formatter={v => <span className="text-muted-foreground text-xs">{v}</span>}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Bottom row ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Upcoming deadlines */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-amber-500" />
                <h2 className="text-foreground font-semibold text-sm">Upcoming Deadlines</h2>
              </div>
              <span className="text-xs text-muted-foreground">{upcoming.length} tasks</span>
            </div>
            {upcoming.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center">
                <CheckCircle2 size={28} className="text-emerald-500 mb-2" />
                <p className="text-muted-foreground text-sm">No upcoming deadlines 🎉</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.map(t => {
                  const daysLeft = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={t._id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border hover:bg-secondary/50 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm font-medium truncate">{t.title}</p>
                        <p className="text-muted-foreground text-xs mt-0.5 truncate">{t.project?.title}</p>
                      </div>
                      <span className={cn(
                        "ml-3 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0",
                        daysLeft <= 2 ? "bg-destructive/10 text-destructive" : daysLeft <= 5 ? "bg-orange-500/10 text-orange-500" : "bg-primary/10 text-primary"
                      )}>
                        {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent projects */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FolderKanban size={16} className="text-primary" />
                <h2 className="text-foreground font-semibold text-sm">Recent Projects</h2>
              </div>
              <Link to="/projects" className="text-xs text-primary hover:underline flex items-center gap-1 transition-colors">
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            {projects.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center">
                <FolderKanban size={28} className="text-muted-foreground mb-2 opacity-50" />
                <p className="text-muted-foreground text-sm">No projects yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 5).map(p => (
                  <Link key={p._id} to={`/projects/${p._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border hover:bg-secondary/50 hover:border-primary/20 transition-all group"
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || 'hsl(var(--primary))' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm font-medium truncate group-hover:text-primary transition-colors">{p.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.progress || 0}%`, backgroundColor: p.color || 'hsl(var(--primary))' }} />
                        </div>
                        <span className="text-muted-foreground text-[10px] flex-shrink-0 font-medium">{p.progress || 0}%</span>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admin: team productivity */}
        {isAdmin && analytics?.tasksPerUser?.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} className="text-violet-500" />
              <h2 className="text-foreground font-semibold text-sm">Team Productivity</h2>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analytics.tasksPerUser} layout="vertical" barSize={20}>
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
