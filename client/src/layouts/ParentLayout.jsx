import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { LayoutDashboard, LogOut, Menu, School } from 'lucide-react';
import ZenyaChat from '../components/common/ZenyaChat';
import ChangePassword from '../components/common/ChangePassword';

const navItems = [
  { path: '/parent', label: 'Dashboard', icon: LayoutDashboard },
];

const ParentLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = () => {
  if (window.confirm('Are you sure you want to logout?')) {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  }
};

  return (
    <div className="flex h-screen bg-gray-100 font-roboto overflow-hidden">

      {/* Change Password Modal */}
      {showChangePassword && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:'420px' }}>
            <ChangePassword onClose={() => setShowChangePassword(false)}/>
          </div>
        </div>
      )}

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
        <nav className="flex-1 px-2 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
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

        {/* User + Actions */}
        <div className="px-2 py-3 border-t border-white/10">
          {!collapsed && (
            <div className="px-3 py-2 mb-2">
              <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-white/50 text-xs truncate">{user?.email}</p>
              <span className="mt-1 inline-block bg-[#F5C518] text-[#0d6b7a] text-xs font-bold px-2 py-0.5 rounded-full">
                PARENT
              </span>
            </div>
          )}

          {/* Change Password */}
          <button onClick={() => setShowChangePassword(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm font-medium mb-1"
          >
            <span style={{ fontSize:16 }}>🔐</span>
            {!collapsed && <span>Change Password</span>}
          </button>

          {/* Logout */}
          <button onClick={handleLogout}
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
            <button onClick={() => setCollapsed(!collapsed)} className="text-[#0d6b7a] hover:text-[#F5C518] transition-colors">
              <Menu size={22}/>
            </button>
            <h1 className="text-lg font-bold text-gray-800">
              {navItems.find(n => n.path === location.pathname)?.label || 'Parent Portal'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Parent</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      <ZenyaChat/>
    </div>
  );
};

export default ParentLayout;
