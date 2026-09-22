// --- Shared Sidebar Component ---
import { Link } from 'react-router-dom';
import { BookOpen, Users, CheckCircle, Wallet, BrainCircuit, Radio } from 'lucide-react';

export const Sidebar = ({ activePage }) => (
  <aside className="w-64 bg-[#0d3b72] text-white flex flex-col shadow-2xl z-20 h-screen sticky top-0">
    <div className="p-8">
      <h2 className="text-2xl font-bold tracking-tighter italic">Edu<span className="text-[#7ec8f5]">Nest</span></h2>
      <p className="text-[10px] text-blue-300 mt-1 uppercase tracking-widest font-black opacity-60">Admin System</p>
    </div>

    <nav className="flex-1 px-4 space-y-2">
      <SidebarLink to="/ClassManagement" icon={<BookOpen size={20} />} label="Class Management" active={activePage === 'class'} />
      <SidebarLink to="/StudentManagement" icon={<Users size={20} />} label="Student Management" active={activePage === 'student'} />
      <SidebarLink to="/admin/attendance" icon={<CheckCircle size={20} />} label="Attendance Management" active={activePage === 'attendance'} />
      <SidebarLink to="/FeeManagement" icon={<Wallet size={20} />} label="Fee Management" active={activePage === 'fee'} />
      <SidebarLink to="/ChatbotManagement" icon={<BrainCircuit size={20} />} label="Chatbot Management" active={activePage === 'chatbot'} />
    </nav>

    <div className="p-6 border-t border-white/10">
      <div className="bg-blue-600/20 p-4 rounded-xl border border-blue-400/20">
        <p className="text-[10px] font-black text-blue-200 flex items-center gap-2 uppercase">
          <Radio size={12} className="animate-pulse" /> System Online
        </p>
      </div>
    </div>
  </aside>
);

const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${active ? 'bg-white/10 text-[#7ec8f5] shadow-inner font-bold' : 'text-white/40 hover:text-white hover:bg-white/5'
    }`}>
    {icon} <span className="text-sm">{label}</span>
  </Link>
);