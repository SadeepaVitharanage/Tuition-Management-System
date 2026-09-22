import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  ClipboardList, CreditCard, UserCheck, LogOut, Menu, School
} from 'lucide-react';

const navItems = [
  { path: '/admin',               label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/admin/registrations', label: 'Registrations', icon: UserCheck       },
  { path: '/admin/students',      label: 'Students',      icon: Users           },
  { path: '/admin/teachers',      label: 'Teachers',      icon: GraduationCap   },
  { path: '/admin/classes',       label: 'Classes',       icon: BookOpen        },
  { path: '/admin/attendance',    label: 'Attendance',    icon: ClipboardList   },
  { path: '/admin/fees',          label: 'Fees & Payments', icon: CreditCard    },
];

const AdminLayout = ({ children }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
  if (window.confirm('Are you sure you want to logout?')) {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  }
};

  return (
    <div className="flex h-screen bg-gray-100 font-roboto overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-[#0d6b7a] flex flex-col transition-all duration-300 flex-shrink-0 shadow-lg`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <School size={22} className="text-[#F5C518]"/>
              <span className="text-[#F5C518] font-bold text-xl">XenEdu</span>
            </div>
          )}
          {collapsed && <School size={22} className="text-[#F5C518] mx-auto"/>}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="text-white/60 hover:text-white">
              <Menu size={20}/>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium
                  ${isActive
                    ? 'bg-[#F5C518]/15 text-[#F5C518] border-l-4 border-[#F5C518]'
                    : 'text-white/70 hover:bg-white/10 hover:text-white border-l-4 border-transparent'
                  }`}
              >
                <Icon size={18}/>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-2 py-3 border-t border-white/10">
          {!collapsed && (
            <div className="px-3 py-2 mb-2">
              <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-white/50 text-xs truncate">{user?.email}</p>
              <span className="mt-1 inline-block bg-[#F5C518] text-[#0d6b7a] text-xs font-bold px-2 py-0.5 rounded-full">
                ADMIN
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-medium"
          >
            <LogOut size={18}/>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="bg-white h-16 px-6 flex items-center justify-between border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-[#0d6b7a] hover:text-[#F5C518] transition-colors"
            >
              <Menu size={22}/>
            </button>
            <h1 className="text-lg font-bold text-gray-800">
              {navItems.find(n => n.path === location.pathname)?.label || 'Admin Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Administrator</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
