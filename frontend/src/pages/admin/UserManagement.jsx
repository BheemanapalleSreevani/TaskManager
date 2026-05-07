import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Users, Trash2, Search, UserCheck, UserX, ShieldCheck, Crown, ChevronDown, MoreVertical } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const roleConfig = {
  admin:  { cls: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30', icon: ShieldCheck },
  member: { cls: 'bg-gray-500/15   text-gray-400   border border-gray-500/25',   icon: Users       },
};

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    adminService.getUsers()
      .then(res => setUsers(res.data.data || []))
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      const res = await adminService.updateRole(id, role);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: res.data.data.role } : u));
      toast.success(`Role updated to ${role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await adminService.toggleStatus(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.data.isActive } : u));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;
    try {
      await adminService.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const filtered = users.filter(u => {
    const ms = u.name.toLowerCase().includes(search.toLowerCase()) ||
               u.email.toLowerCase().includes(search.toLowerCase());
    const mf = !roleFilter || u.role === roleFilter;
    return ms && mf;
  });

  const adminCount  = users.filter(u => u.role === 'admin').length;
  const memberCount = users.filter(u => u.role === 'member').length;
  const activeCount = users.filter(u => u.isActive !== false).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-screen-2xl">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} registered users</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Users',  value: users.length,  color: '#6366f1' },
            { label: 'Admins',       value: adminCount,    color: '#8b5cf6' },
            { label: 'Active',       value: activeCount,   color: '#10b981' },
          ].map((s, i) => (
            <div key={i} className="bg-[#0c0c1e] border border-white/[0.07] rounded-2xl p-4">
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-2xl font-black text-white">{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['', 'admin', 'member'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                  roleFilter === r
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white'
                }`}
              >
                {r === '' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users size={40} className="text-gray-700 mb-3" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    {['User', 'Role', 'Status', 'Joined', ''].map((h, i) => (
                      <th key={i} className="text-left px-4 sm:px-5 py-3 text-[10px] sm:text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filtered.map((u, idx) => {
                    const isCurrentUser = u._id === currentUser?._id;
                    const rc = roleConfig[u.role] || roleConfig.member;
                    const RoleIcon = rc.icon;
                    return (
                      <motion.tr
                        key={u._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="table-row group hover:bg-secondary/20 transition-colors"
                      >
                        {/* User */}
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="relative flex-shrink-0">
                              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xs sm:text-sm font-bold shadow-sm">
                                {u.name?.[0]?.toUpperCase()}
                              </div>
                              {u.role === 'admin' && (
                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                                  <Crown size={8} className="text-white sm:w-[9px] sm:h-[9px]" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-foreground text-xs sm:text-sm font-semibold truncate">
                                {u.name}
                                {isCurrentUser && <span className="ml-1.5 sm:ml-2 text-[9px] sm:text-[10px] text-primary font-normal">(you)</span>}
                              </p>
                              <p className="text-muted-foreground text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-48">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          {isCurrentUser ? (
                            <span className={`inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full capitalize ${rc.cls}`}>
                              <RoleIcon size={10} className="sm:w-[11px] sm:h-[11px]" />
                              {u.role}
                            </span>
                          ) : (
                            <div className="relative inline-block">
                              <select
                                value={u.role}
                                onChange={e => handleRoleChange(u._id, e.target.value)}
                                className={`appearance-none pl-2 pr-5 sm:pr-6 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border-0 outline-none cursor-pointer capitalize ${rc.cls}`}
                              >
                                <option value="member">member</option>
                                <option value="admin">admin</option>
                              </select>
                              <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <span className={`inline-flex items-center text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${
                            u.isActive !== false
                              ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25'
                              : 'bg-destructive/15 text-destructive border border-destructive/25'
                          }`}>
                            <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mr-1 sm:mr-1.5 ${u.isActive !== false ? 'bg-emerald-500' : 'bg-destructive'}`} />
                            {u.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-muted-foreground text-[10px] sm:text-sm whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>

                        {/* Actions */}
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          {!isCurrentUser && (
                            <div className="flex items-center justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleToggleStatus(u._id)}
                                title={u.isActive !== false ? 'Deactivate' : 'Activate'}
                                className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                                  u.isActive !== false
                                    ? 'text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10'
                                    : 'text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10'
                                }`}
                              >
                                {u.isActive !== false ? <UserX size={14} className="sm:w-[15px] sm:h-[15px]" /> : <UserCheck size={14} className="sm:w-[15px] sm:h-[15px]" />}
                              </button>
                              <button
                                onClick={() => handleDelete(u._id)}
                                title="Delete user"
                                className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                              >
                                <Trash2 size={14} className="sm:w-[15px] sm:h-[15px]" />
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
