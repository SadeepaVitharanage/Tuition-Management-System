import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, GraduationCap, Calendar, CreditCard, Bot,
  BarChart3, Settings, LogOut, Search, Bell,
  ChevronRight, Plus, UserCheck, Clock, Home,
  TrendingUp, AlertCircle, FileBarChart2
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  const stats = [
    { label: 'Total Students', value: '1,284', icon: <Users size={20} />, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
    { label: 'Active Teachers', value: '42', icon: <UserCheck size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+3%' },
    { label: 'Monthly Revenue', value: 'LKR 450k', icon: <CreditCard size={20} />, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+8%' },
    { label: 'AI Queries', value: '856', icon: <Bot size={20} />, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+21%' },
  ];

  // Each section links to its management page
  const sections = [
    {
      title: 'Student Management',
      desc: 'Enrollment, profiles & documents',
      icon: <GraduationCap size={22} />,
      count: '12 New',
      countColor: 'bg-blue-100 text-blue-700',
      to: '/StudentManagement',
    },
    {
      title: 'Class & Scheduling',
      desc: 'Timetables and hall allocations',
      icon: <Calendar size={22} />,
      count: '8 Today',
      countColor: 'bg-emerald-100 text-emerald-700',
      to: '/ClassManagement',
    },
    {
      title: 'Fee Management',
      desc: 'Invoicing, receipts & arrears',
      icon: <CreditCard size={22} />,
      count: '15 Pending',
      countColor: 'bg-amber-100 text-amber-700',
      to: '/FeeManagement',
    },
    {
      title: 'Attendance Management',
      desc: 'View records & generate reports',
      icon: <FileBarChart2 size={22} />,
      count: '2 At-Risk',
      countColor: 'bg-red-100 text-red-700',
      to: '/AttendanceManagement',
    },
    {
      title: 'AI Chatbot Control',
      desc: 'Knowledge base & bot training',
      icon: <Bot size={22} />,
      count: 'Online',
      countColor: 'bg-purple-100 text-purple-700',
      to: '/ChatbotManagement',
    },
    {
      title: 'Analytics & Reports',
      desc: 'Performance trends & insights',
      icon: <TrendingUp size={22} />,
      count: 'Live',
      countColor: 'bg-indigo-100 text-indigo-700',
      to: '/admin-dashboard',   // stays on dashboard for now
    },
  ];

  const navItems = [
    { label: 'Overview', icon: <BarChart3 size={18} /> },
    { label: 'Students', icon: <GraduationCap size={18} /> },
    { label: 'Teachers', icon: <Users size={18} /> },
    { label: 'Finances', icon: <CreditCard size={18} /> },
    { label: 'Reports', icon: <BarChart3 size={18} /> },
    { label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">

      {/* ── Sidebar ──────────────────────────────────── */}
      <aside className="w-64 bg-[#0d3b72] text-white hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 bg-[#f0b429] rounded-lg flex items-center justify-center text-[#0d3b72] font-bold text-sm">E</div>
          <div>
            <span className="text-lg font-serif font-bold leading-none">EduNest</span>
            <span className="text-[9px] block opacity-50 uppercase tracking-tighter mt-0.5">Admin Pro</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.label
                ? 'bg-[#f0b429] text-[#0d3b72]'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          <div className="pt-4 border-t border-white/10 mt-4 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 px-4 pb-2">Quick Navigate</p>
            <Link to="/StudentManagement" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white transition-all">
              <GraduationCap size={15} /> Students
            </Link>
            <Link to="/ClassManagement" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white transition-all">
              <Calendar size={15} /> Classes
            </Link>
            <Link to="/FeeManagement" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white transition-all">
              <CreditCard size={15} /> Fees
            </Link>
            <Link to="/AttendanceManagement" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white transition-all">
              <FileBarChart2 size={15} /> Attendance Management
            </Link>
            <Link to="/ChatbotManagement" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white transition-all">
              <Bot size={15} /> AI Chatbot
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 hover:text-white rounded-xl text-sm font-medium transition-all">
            <Home size={16} /> Back to Home
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-all mt-1">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#0d3b72]">Institutional Overview</h2>
            <p className="text-[11px] text-slate-400 font-medium">
              {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search students, reports..."
                className="w-72 pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#0d3b72] outline-none"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#0d3b72]">Admin User</p>
                <p className="text-[10px] text-slate-500">Super Administrator</p>
              </div>
              <div className="w-10 h-10 bg-[#0d3b72] rounded-full flex items-center justify-center text-white font-bold text-sm">AD</div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">

          {/* Alert Banner */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-amber-800 uppercase tracking-tight">Action Required</p>
              <p className="text-[11px] text-amber-700/80 font-medium">2 students are below 50% attendance threshold. Review their records in the Attendance Reports module.</p>
            </div>
            <Link
              to="/AttendanceManagement"
              className="text-[10px] font-black text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-all uppercase tracking-wide shrink-0"
            >
              View Now →
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {stat.trend}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-[#0d3b72] mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Management Modules */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-bold text-[#0d3b72]">Management Modules</h3>
            <button
              onClick={() => navigate('/ClassManagement')}
              className="bg-[#0d3b72] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#1a6fc4] transition-all"
            >
              <Plus size={16} /> Create New Class
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((sec, i) => (
              <Link
                key={i}
                to={sec.to}
                className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-[#f0b429] hover:shadow-lg transition-all group cursor-pointer no-underline block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-50 text-[#0d3b72] rounded-xl flex items-center justify-center group-hover:bg-[#0d3b72] group-hover:text-white transition-all shadow-sm">
                    {sec.icon}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${sec.countColor}`}>
                    {sec.count}
                  </span>
                </div>
                <h4 className="font-bold text-[#0d3b72] mb-1 text-sm">{sec.title}</h4>
                <p className="text-xs text-slate-500 mb-4">{sec.desc}</p>
                <div className="flex items-center text-xs font-bold text-[#0d3b72] gap-1 group-hover:gap-2 transition-all">
                  Open Module <ChevronRight size={14} className="text-[#f0b429]" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;