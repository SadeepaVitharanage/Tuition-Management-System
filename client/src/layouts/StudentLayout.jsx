import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { LayoutDashboard, BookOpen, LogOut, Menu, School } from 'lucide-react';
import ZenyaChat from '../components/common/ZenyaChat';
import ChangePassword from '../components/common/ChangePassword';

const navItems = [
  { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/classes', label: 'Browse Classes', icon: BookOpen },
];

const StudentLayout = ({ children }) => {
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
      <style>{`
        @keyframes siriMove { 0% { background-position: 0% 50%; } 25% { background-position: 100% 0%; } 50% { background-position: 100% 100%; } 75% { background-position: 0% 100%; } 100% { background-position: 0% 50%; } }
        @keyframes siriPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes blob1 { 0%, 100% { transform: translate(0,0) scale(1); opacity: 0.5; } 50% { transform: translate(4px,-4px) scale(1.2); opacity: 0.8; } }
        @keyframes blob2 { 0%, 100% { transform: translate(0,0) scale(1); opacity: 0.6; } 50% { transform: translate(-4px,4px) scale(1.2); opacity: 0.9; } }
      `}</style>

      {showChangePassword && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:'420px' }}><ChangePassword onClose={() => setShowChangePassword(false)}/></div>
        </div>
      )}

      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-[#0d6b7a] flex flex-col transition-all duration-300 flex-shrink-0 shadow-lg`}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {!collapsed && (<div className="flex items-center gap-2"><School size={22} className="text-[#F5C518]"/><span className="text-[#F5C518] font-bold text-xl">XenEdu</span></div>)}
          {collapsed && <School size={22} className="text-[#F5C518] mx-auto"/>}
          {!collapsed && (<button onClick={() => setCollapsed(true)} className="text-white/60 hover:text-white"><Menu size={20}/></button>)}
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium
                  ${isActive ? 'bg-[#F5C518]/15 text-[#F5C518] border-l-4 border-[#F5C518]' : 'text-white/70 hover:bg-white/10 hover:text-white border-l-4 border-transparent'}`}>
                <Icon size={18}/>{!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 py-3 border-t border-white/10">
          {!collapsed && (
            <div className="px-3 py-2 mb-2">
              <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-white/50 text-xs truncate">{user?.email}</p>
              <span className="mt-1 inline-block bg-[#F5C518] text-[#0d6b7a] text-xs font-bold px-2 py-0.5 rounded-full">STUDENT</span>
            </div>
          )}
          <button onClick={() => setShowChangePassword(true)} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm font-medium mb-1">
            <span style={{ fontSize:'16px' }}>🔐</span>{!collapsed && <span>Change Password</span>}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-medium">
            <LogOut size={18}/>{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white h-16 px-6 flex items-center justify-between border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setCollapsed(!collapsed)} className="text-[#0d6b7a] hover:text-[#F5C518] transition-colors"><Menu size={22}/></button>
            <h1 className="text-lg font-bold text-gray-800">{navItems.find(n => n.path === location.pathname)?.label || 'Student Portal'}</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* AI Tutor button */}
            <button onClick={() => navigate('/student/learn')} style={{ display:'flex', alignItems:'center', gap:'8px', background:'linear-gradient(135deg, #0a1a14, #0d2a1f)', border:'1px solid rgba(0,255,180,0.25)', borderRadius:'14px', padding:'7px 14px', cursor:'pointer', boxShadow:'0 0 16px rgba(0,255,180,0.12)', transition:'all 0.3s ease', minWidth:'max-content' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 28px rgba(0,255,180,0.3)'; e.currentTarget.style.borderColor='rgba(0,255,180,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='0 0 16px rgba(0,255,180,0.12)'; e.currentTarget.style.borderColor='rgba(0,255,180,0.25)'; }}
            >
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, #00FFD1, #00b8c8 25%, #0d6b7a 60%, #00b8c8 90%)', backgroundSize:'300% 300%', animation:'siriMove 6s ease infinite, siriPulse 3s ease-in-out infinite', boxShadow:'0 0 10px rgba(0,255,180,0.6)', flexShrink:0, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', width:'16px', height:'16px', borderRadius:'50%', background:'rgba(0,255,200,0.5)', top:'3px', left:'0px', filter:'blur(5px)', animation:'blob1 4s ease-in-out infinite' }}/>
                <div style={{ position:'absolute', width:'12px', height:'12px', borderRadius:'50%', background:'rgba(245,197,24,0.4)', bottom:'0px', right:'0px', filter:'blur(4px)', animation:'blob2 5s ease-in-out infinite' }}/>
                <div style={{ position:'absolute', width:'8px', height:'8px', borderRadius:'50%', background:'rgba(255,255,255,0.8)', top:'5px', left:'6px', filter:'blur(2px)' }}/>
              </div>
              <span style={{ fontSize:'13px', fontWeight:'700', color:'#00FFD1', whiteSpace:'nowrap', letterSpacing:'0.01em' }}>AI Tutor</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white font-bold text-sm">{user?.name?.charAt(0)}</div>
              <div><p className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</p><p className="text-xs text-gray-400 mt-0.5">Student</p></div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <ZenyaChat/>
    </div>
  );
};

export default StudentLayout;