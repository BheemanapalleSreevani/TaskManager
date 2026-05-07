import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  User, LogOut, Menu, X, Sun, Moon, ShieldCheck, Users, ChevronRight,
} from 'lucide-react';

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 80;

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects',  icon: FolderKanban,   label: 'Projects'  },
  { to: '/tasks',     icon: CheckSquare,    label: 'Tasks'     },
  { to: '/profile',   icon: User,           label: 'Profile'   },
];

const adminItems = [
  { to: '/admin',       icon: ShieldCheck, label: 'Analytics' },
  { to: '/admin/users', icon: Users,       label: 'Users'     },
];

/* ── Sidebar link ──────────────────────────────────────────────────── */
const SidebarLink = ({ to, icon: Icon, label, collapsed, end = false }) => (
  <NavLink
    to={to}
    end={end}
    title={collapsed ? label : undefined}
    className={({ isActive }) => cn(
      "sidebar-link group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative mb-1",
      isActive
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    )}
  >
    <Icon size={20} className={cn("flex-shrink-0", collapsed && "mx-auto")} />
    {!collapsed && (
      <span className="whitespace-nowrap flex-1">{label}</span>
    )}
    {/* Tooltip when collapsed */}
    {collapsed && (
      <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 text-xs bg-popover border border-border text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
        {label}
      </span>
    )}
  </NavLink>
);

/* ── Sidebar ────────────────────────────────────────────────────────── */
const Sidebar = ({ collapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed left-0 top-0 h-[100dvh] z-50 flex flex-col bg-card border-r border-border transition-transform duration-300 md:translate-x-0 overflow-hidden",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
        style={{ width: collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      >
        {/* Logo */}
        <div className={cn("flex items-center h-16 border-b border-border px-4 flex-shrink-0", collapsed ? "justify-center" : "gap-3")}>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <FolderKanban size={18} className="text-primary-foreground" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <p className="text-foreground font-bold text-lg leading-none tracking-tight">TaskFlow</p>
            </motion.div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto overflow-x-hidden hide-scrollbar">
          <div className="space-y-1">
            {navItems.map(item => (
              <SidebarLink key={item.to} {...item} collapsed={collapsed} />
            ))}
          </div>

          {isAdmin && (
            <div className="mt-8 space-y-1">
              <div className={cn("mb-3", collapsed ? "text-center" : "px-3")}>
                {!collapsed
                  ? <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Admin</p>
                  : <div className="h-px bg-border w-8 mx-auto" />
                }
              </div>
              {adminItems.map(item => (
                <SidebarLink key={item.to} {...item} collapsed={collapsed} end />
              ))}
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="flex-shrink-0 border-t border-border p-3">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2 bg-secondary/50">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0 shadow-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-muted-foreground text-xs capitalize truncate">{user?.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={cn(
              "flex items-center w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 text-sm font-medium group relative",
              collapsed ? "justify-center p-3" : "px-3 py-2.5 gap-3"
            )}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 text-xs bg-popover border border-border text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                Logout
              </span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

/* ── Topbar ─────────────────────────────────────────────────────────── */
const Topbar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-xl flex-shrink-0">
      <div className="flex items-center gap-4">
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex w-10 h-10 rounded-xl items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          <Menu size={20} />
        </button>
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex md:hidden w-10 h-10 rounded-xl items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">TaskFlow</span>
          <ChevronRight size={14} className="text-muted-foreground/50" />
          <span className="text-foreground capitalize">
            {location.pathname.split('/').filter(Boolean).join(' / ') || 'Dashboard'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};

/* ── Dashboard Layout ───────────────────────────────────────────────── */
const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden font-sans">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Wrapper */}
      <div
        className={cn(
          "flex-1 flex flex-col h-[100dvh] transition-all duration-300 w-full relative",
          collapsed ? "md:ml-[80px]" : "md:ml-[280px]"
        )}
      >
        <Topbar 
          collapsed={collapsed} 
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="pb-20 md:pb-24 min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
