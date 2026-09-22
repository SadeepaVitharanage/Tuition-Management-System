import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Clock, ChevronRight, LayoutDashboard, Bell } from 'lucide-react';
import Chatbot from '../components/Chatbot'; // 1. Import the Chatbot component

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  // Available Grades in Sri Lankan School System
  const grades = [
    { id: 6, title: "Grade 06", students: "120+ Students", color: "bg-blue-500" },
    { id: 7, title: "Grade 07", students: "115+ Students", color: "bg-indigo-500" },
    { id: 8, title: "Grade 08", students: "130+ Students", color: "bg-purple-500" },
    { id: 9, title: "Grade 09", students: "110+ Students", color: "bg-pink-500" },
    { id: 10, title: "Grade 10", students: "200+ Students", color: "bg-orange-500" },
    { id: 11, title: "Grade 11", students: "250+ Students", color: "bg-red-500" },
    { id: 12, title: "Grade 12 (A/L)", students: "300+ Students", color: "bg-emerald-500" },
    { id: 13, title: "Grade 13 (A/L)", students: "280+ Students", color: "bg-teal-500" },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] flex relative"> {/* Added relative positioning */}
      {/* Sidebar */}
      <div className="w-64 bg-[#0d3b72] min-h-screen p-6 hidden md:block">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-[#0d3b72]">E</div>
          <span className="text-white font-serif font-bold text-xl">EduNest</span>
        </div>
        <nav className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-white/10 text-white rounded-xl cursor-pointer font-bold text-sm">
            <LayoutDashboard size={18} /> Dashboard
          </div>
          <div className="flex items-center gap-3 p-3 text-white/60 hover:bg-white/5 rounded-xl cursor-pointer text-sm">
            <BookOpen size={18} /> My Subjects
          </div>
          <div className="flex items-center gap-3 p-3 text-white/60 hover:bg-white/5 rounded-xl cursor-pointer text-sm">
            <Clock size={18} /> Timetable
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#0d3b72]">Student Dashboard</h1>
            <p className="text-[#6b92b8] text-sm">Welcome back, select your grade to view subjects.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 bg-white border border-[#d0e4f7] rounded-full text-[#6b92b8] hover:text-[#0d3b72]">
              <Bell size={20} />
            </button>
            <div className="w-10 h-10 bg-[#f0b429] rounded-full flex items-center justify-center font-bold text-[#0d3b72]">KP</div>
          </div>
        </header>

        {/* Grades Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {grades.map((grade) => (
            <div 
              key={grade.id}
              onClick={() => navigate(`/subjects/${grade.id}`)}
              className="group bg-white border border-[#d0e4f7] p-6 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-16 h-16 ${grade.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`} />
              
              <div className={`w-12 h-12 ${grade.color} text-white rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <GraduationCap size={24} />
              </div>
              
              <h3 className="text-lg font-bold text-[#0d3b72]">{grade.title}</h3>
              <p className="text-xs text-[#6b92b8] mb-4">{grade.students}</p>
              
              <div className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-[#1a6fc4] group-hover:gap-2 transition-all">
                View Subjects <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 2. Place the Chatbot component here */}
      <Chatbot />
    </div>
  );
};

export default StudentDashboard;