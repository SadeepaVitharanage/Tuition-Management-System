import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Calendar, CheckCircle, MessageSquare,
  Clock, BookOpen, Bell, Search, LogOut,
  ChevronRight, PlayCircle, Home, Radio,
  BarChart2, TrendingUp, Plus, FileText, UserCheck
} from 'lucide-react';
import TutorChatbot from '../components/TutorChatbot'; // --- ADDED IMPORT ---

// ── Tutor Sidebar ──────────────────────────────────────────────────────────────
const TutorSidebar = ({ activePage }) => (
  <aside className="w-64 bg-[#064e3b] text-white hidden lg:flex flex-col sticky top-0 h-screen">
    <div className="p-6 flex items-center gap-3 border-b border-white/10">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#064e3b] font-bold text-sm">E</div>
      <div>
        <span className="text-lg font-serif font-bold leading-none">EduNest</span>
        <span className="text-[9px] block opacity-50 uppercase tracking-tighter mt-0.5">Teacher Portal</span>
      </div>
    </div>

    <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto">
      {[
        { name: 'Dashboard', icon: <Home size={17} />, to: '/teacher-portal' },
        { name: 'Attendance', icon: <UserCheck size={17} />, to: '/AttendanceManagement' },
        { name: 'Study Materials', icon: <BookOpen size={17} />, to: '#' },
        { name: 'Messages', icon: <MessageSquare size={17} />, to: '#' },
      ].map(item => (
        <Link
          key={item.name}
          to={item.to}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activePage === item.name
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
        >
          {item.icon} {item.name}
        </Link>
      ))}
    </nav>

    <div className="p-4 border-t border-white/10">
      <button className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-all">
        <LogOut size={16} /> Logout
      </button>
    </div>
  </aside>
);

// ── Data ───────────────────────────────────────────────────────────────────────
const todayClasses = [
  { id: 'CLS-001', time: '08:30 AM', subject: 'Pure Mathematics', grade: 'Grade 12', hall: 'Hall 04', students: 28, status: 'Ongoing' },
  { id: 'CLS-002', time: '01:30 PM', subject: 'Applied Mathematics', grade: 'Grade 13', hall: 'Main Hall', students: 22, status: 'Upcoming' },
];

const quickStats = [
  { label: 'Total Students', value: '450', icon: <Users size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Sessions Today', value: '02', icon: <Clock size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Avg Attendance', value: '92%', icon: <CheckCircle size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Students Absent', value: '04', icon: <UserCheck size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const pendingTasks = [
  { title: 'Mark Attendance', sub: 'Pure Math — Grade 12', urgent: true },
  { title: 'Approve Leave Req', sub: 'S. Gamage', urgent: true },
  { title: 'Upload Quiz', sub: 'Unit Test 04', urgent: false },
  { title: 'Grade Assignments', sub: 'Applied Math', urgent: false },
];

const recentActivity = [
  { text: 'Attendance submitted for Grade 12 Math', time: 'Yesterday', icon: <CheckCircle size={14} className="text-green-500" /> },
  { text: 'New message from Admin', time: '2h ago', icon: <MessageSquare size={14} className="text-blue-500" /> },
  { text: 'Class recording uploaded', time: 'Yesterday', icon: <PlayCircle size={14} className="text-purple-500" /> },
];

// ── Main Component ─────────────────────────────────────────────────────────────
const TutorDashboard = () => {
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState('');

  return (
    // --- UPDATED: added 'relative' to flex container for chatbot positioning ---
    <div className="min-h-screen bg-[#f0fdf4] flex relative">
      <TutorSidebar activePage="Dashboard" />

      <main className="flex-1 overflow-y-auto">

        {/* ── Header ── */}
        <header className="bg-white border-b border-emerald-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#064e3b]">Welcome back, Ms. Nadeeka 👋</h2>
            <p className="text-[11px] text-slate-400 font-medium">
              {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
              <Search size={15} className="text-slate-400" />
              <input type="text" placeholder="Search student ID..." className="bg-transparent border-none outline-none text-xs w-32" />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-10 h-10 bg-[#064e3b] rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-emerald-100 cursor-pointer">
              NK
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">

          {/* ── Ongoing Session Alert ── */}
          {todayClasses.some(c => c.status === 'Ongoing') && (
            <div className="bg-[#064e3b] text-white rounded-2xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <Radio size={20} className="text-emerald-300 animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Live Class Ongoing</p>
                  <p className="text-sm font-bold">
                    {todayClasses.find(c => c.status === 'Ongoing')?.subject} —{' '}
                    {todayClasses.find(c => c.status === 'Ongoing')?.grade}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/AttendanceManagement')}
                className="bg-white text-[#064e3b] px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide hover:bg-emerald-50 transition-all flex items-center gap-2"
              >
                <UserCheck size={14} /> Mark Attendance
              </button>
            </div>
          )}

          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {quickStats.map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>{stat.icon}</div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-bold text-[#064e3b]">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left col: Schedule + Announcement */}
            <div className="lg:col-span-2 space-y-6">

              {/* Today's Schedule */}
              <div className="bg-white border border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-[#f0fdf9]">
                  <div>
                    <h3 className="font-bold text-[#064e3b] text-sm">Today's Teaching Schedule</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{todayClasses.length} sessions planned</p>
                  </div>
                  <Calendar size={18} className="text-emerald-400" />
                </div>
                <div className="p-5 space-y-4">
                  {todayClasses.map((cls, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${cls.status === 'Ongoing'
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-slate-50 border-slate-100 hover:border-emerald-200'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[72px]">
                          <p className={`text-xs font-bold ${cls.status === 'Ongoing' ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {cls.time}
                          </p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase ${cls.status === 'Ongoing'
                              ? 'bg-emerald-200 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                            }`}>
                            {cls.status}
                          </span>
                        </div>
                        <div className="w-px h-10 bg-slate-200" />
                        <div>
                          <h4 className="font-bold text-sm text-[#064e3b]">{cls.subject}</h4>
                          <p className="text-[11px] text-slate-500">{cls.grade} • {cls.hall} • {cls.students} students</p>
                        </div>
                      </div>

                      {cls.status === 'Ongoing' ? (
                        <Link
                          to="/AttendanceManagement"
                          className="flex items-center gap-2 px-4 py-2 bg-[#064e3b] text-white rounded-xl text-[10px] font-black uppercase tracking-wide hover:bg-emerald-800 transition-all shadow shadow-emerald-200"
                        >
                          <UserCheck size={14} /> Mark Attendance
                        </Link>
                      ) : (
                        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2">
                          <ChevronRight size={14} /> View Details
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Announcement Panel */}
              <div className="bg-[#064e3b] rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-sm font-bold mb-1">Broadcast to Students</h3>
                  <p className="text-emerald-100/60 text-[11px] mb-4">Post a quick update about exams or class rescheduling.</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write something for your students..."
                      value={announcement}
                      onChange={e => setAnnouncement(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-white/40 transition-colors"
                    />
                    <button className="bg-white text-[#064e3b] px-5 py-2 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all flex items-center gap-2 shrink-0">
                      Post
                    </button>
                  </div>
                </div>
                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              </div>

            </div>

            {/* Right col: Quick Actions + Tasks + Activity */}
            <div className="space-y-5">

              {/* Quick Actions */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-[#064e3b] text-sm mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { n: 'Add Note', icon: <Plus size={17} />, to: '#' },
                    { n: 'Mark Attend.', icon: <UserCheck size={17} />, to: '/AttendanceManagement' },
                    { n: 'Reports', icon: <BarChart2 size={17} />, to: '#' },
                    { n: 'Resources', icon: <PlayCircle size={17} />, to: '#' },
                    { n: 'Upload Quiz', icon: <BookOpen size={17} />, to: '#' },
                    { n: 'Messages', icon: <MessageSquare size={17} />, to: '#' },
                  ].map((act, i) => (
                    <Link
                      key={i}
                      to={act.to}
                      className="flex flex-col items-center justify-center p-3.5 bg-slate-50 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-transparent hover:border-emerald-100 group"
                    >
                      <div className="text-slate-400 group-hover:text-emerald-600 transition-colors mb-2">{act.icon}</div>
                      <span className="text-[9px] font-bold uppercase text-center leading-tight text-slate-500 group-hover:text-emerald-700">{act.n}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[#064e3b] text-sm">Pending Tasks</h3>
                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                    {pendingTasks.filter(t => t.urgent).length} Urgent
                  </span>
                </div>
                <div className="space-y-3">
                  {pendingTasks.map((task, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${task.urgent ? 'bg-red-400' : 'bg-slate-300'}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-700">{task.title}</p>
                          <p className="text-[10px] text-slate-400">{task.sub}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-[#064e3b] text-sm mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-700 leading-snug">{item.text}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      
      {/* --- ADDED CHATBOT COMPONENT --- */}
      <TutorChatbot />
    </div>
  );
};

export default TutorDashboard;