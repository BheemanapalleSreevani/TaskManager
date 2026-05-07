import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, FolderKanban, CheckCircle2, AlertTriangle,
  TrendingUp, Flame, ShieldCheck, ArrowUpRight, Clock,
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminService } from '../../services/adminService';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-2.5 shadow-2xl text-sm z-50">
      {label && <p className="text-muted-foreground mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.fill || 'hsl(var(--primary))' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, gradient, sub, to, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07 }}
    whileHover={{ y: -3 }}
    className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 shadow-sm"
  >
    <div className={`absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-br ${gradient} opacity-10 blur-2xl rounded-full`} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-3">{label}</p>
        <p className="text-foreground text-3xl font-black">{value ?? <span className="text-muted-foreground">—</span>}</p>
        {sub && <p className="text-muted-foreground text-xs mt-1">{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        <Icon size={19} className="text-white" />
      </div>
    </div>
    {to && (
      <Link to={to} className="mt-4 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors relative font-medium">
        View all <ArrowUpRight size={12} />
      </Link>
    )}
  </motion.div>
);

const AdminDashboard = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAnalytics()
      .then(res => setData(res.data.data))
      .catch(err => console.error('Failed to load analytics.', err))
      .finally(() => setLoading(false));
  }, []);

  const ov = data?.overview || {};

  const pieData = [
    { name: 'Todo',        value: ov.todoTasks || 0,       fill: '#6366f1' },
    { name: 'In Progress', value: ov.inProgressTasks || 0, fill: '#f59e0b' },
    { name: 'Done',        value: ov.completedTasks || 0,  fill: '#10b981' },
  ];

  const priorityData = (data?.tasksByPriority || []).map((p, i) => ({
    name:  p._id?.charAt(0).toUpperCase() + p._id?.slice(1),
    value: p.count,
    fill: ['#ef4444', '#f59e0b', '#6366f1'][i] || '#6366f1',
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-screen-2xl">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
            <ShieldCheck size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Analytics</h1>
            <p className="text-gray-500 text-sm mt-0.5">System-wide performance overview</p>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-card border border-border animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard index={0} icon={Users}        label="Total Users"     value={ov.totalUsers}      gradient="from-violet-500 to-purple-600"  to="/admin/users"  />
            <StatCard index={1} icon={FolderKanban} label="Total Projects"  value={ov.totalProjects}   gradient="from-primary to-blue-600"    to="/projects"     />
            <StatCard index={2} icon={CheckCircle2} label="Tasks Completed" value={ov.completedTasks}  gradient="from-emerald-500 to-teal-600"   sub={`${ov.completionRate || 0}% rate`} />
            <StatCard index={3} icon={AlertTriangle}label="Overdue Tasks"   value={ov.overdueTasks}    gradient="from-red-500 to-rose-600"       />
          </div>
        )}

        {/* Completion rate bar */}
        {!loading && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                <h2 className="text-foreground font-semibold text-sm">Overall Completion Rate</h2>
              </div>
              <span className="text-2xl font-black text-primary">{ov.completionRate || 0}%</span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${ov.completionRate || 0}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-violet-600"
              />
            </div>
            <p className="text-muted-foreground text-xs mt-2">
              {ov.completedTasks || 0} of {ov.totalTasks || 0} tasks completed
            </p>
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Tasks by status */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} className="text-primary" />
              <h2 className="text-foreground font-semibold text-sm">Tasks by Status</h2>
            </div>
            {pieData.every(d => d.value === 0) ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    formatter={v => <span className="text-muted-foreground text-xs">{v}</span>}
                    iconType="circle" iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tasks by priority */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Flame size={16} className="text-orange-500" />
              <h2 className="text-foreground font-semibold text-sm">Tasks by Priority</h2>
            </div>
            {priorityData.length === 0 || priorityData.every(d => d.value === 0) ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={priorityData} barSize={40}>
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} width={25} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {priorityData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Team productivity */}
        {(data?.tasksPerUser?.length > 0) && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Users size={16} className="text-violet-500" />
              <h2 className="text-foreground font-semibold text-sm">Team Productivity (Tasks Assigned)</h2>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.tasksPerUser} layout="vertical" barSize={18}>
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent projects */}
        {data?.recentProjects?.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FolderKanban size={16} className="text-primary" />
                <h2 className="text-foreground font-semibold text-sm">Recent Projects</h2>
              </div>
              <Link to="/projects" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {data.recentProjects.map(p => (
                <Link key={p._id} to={`/projects/${p._id}`}
                  className="flex items-center justify-between p-3.5 bg-background/50 border border-border rounded-xl hover:bg-secondary/50 hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-foreground text-sm font-medium group-hover:text-primary transition-colors">{p.title}</p>
                      <p className="text-muted-foreground text-xs">by {p.createdBy?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs">{new Date(p.createdAt).toLocaleDateString()}</span>
                    <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
