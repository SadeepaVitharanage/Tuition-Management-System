import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, BookOpen, AlertCircle, TrendingUp, Download } from 'lucide-react';

const ParentDashboard = () => {
  const navigate = useNavigate();
  
  // Dummy data representing the parent's linked student
  const studentData = {
    name: "Kavindu Perera",
    grade: "Grade 11",
    enrolledCourses: [
      { name: "Mathematics", teacher: "Mr. Samantha P.", status: "Active", progress: 65, nextClass: "Mar 1, 8:30 AM" },
      { name: "Science", teacher: "Ms. Nadeeka K.", status: "Active", progress: 40, nextClass: "Mar 2, 10:00 AM" },
    ],
    payments: [
      { id: "INV-001", subject: "Mathematics", amount: "LKR 2,500", date: "Feb 1, 2026", status: "Paid" },
      { id: "INV-002", subject: "Science", amount: "LKR 2,500", date: "Feb 1, 2026", status: "Paid" },
    ]
  };

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#d0e4f7] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0d3b72] rounded-full flex items-center justify-center text-white font-bold">P</div>
            <h1 className="text-xl font-serif font-bold text-[#0d3b72]">Parent Portal</h1>
          </div>
          <button className="text-sm font-bold text-red-500 hover:text-red-700">Logout</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-white p-8 rounded-3xl border border-[#d0e4f7] shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-serif font-bold text-[#0d3b72]">Welcome Back, Mr. Perera</h2>
            <p className="text-[#6b92b8] mt-1">Monitoring academic progress for <span className="font-bold text-[#0d3b72]">{studentData.name} ({studentData.grade})</span></p>
          </div>
          <div className="flex items-center gap-3 bg-[#fef3c7] p-4 rounded-2xl">
            <TrendingUp className="text-[#c9920a]" size={24} />
            <div>
                <p className="text-[10px] uppercase font-bold text-[#c9920a] tracking-widest">Overall Attendance</p>
                <p className="text-2xl font-bold text-[#0d3b72]">94%</p>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <section>
          <h3 className="text-lg font-bold text-[#0d3b72] mb-5 flex items-center gap-2">
            <BookOpen size={20} className="text-[#f0b429]" /> Enrolled Courses
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {studentData.enrolledCourses.map((course, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-[#d0e4f7] hover:border-[#f0b429] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-lg text-[#0d3b72]">{course.name}</h4>
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{course.status}</span>
                </div>
                <p className="text-xs text-[#6b92b8] mb-4">Tutor: {course.teacher}</p>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div className="bg-[#1a6fc4] h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                </div>
                <p className="text-[10px] text-right text-slate-500 mb-5">{course.progress}% Completed</p>
                
                <div className="text-xs flex justify-between text-slate-500 bg-slate-50 p-3 rounded-lg">
                    <span>Next Class:</span>
                    <span className="font-bold text-[#0d3b72]">{course.nextClass}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Payment History */}
        <section>
          <h3 className="text-lg font-bold text-[#0d3b72] mb-5 flex items-center gap-2">
            <CreditCard size={20} className="text-[#f0b429]" /> Payment History
          </h3>
          <div className="bg-white rounded-2xl border border-[#d0e4f7] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-[#6b92b8] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentData.payments.map((pay) => (
                  <tr key={pay.id} className="text-[#0d3b72]">
                    <td className="p-4 font-mono text-xs">{pay.id}</td>
                    <td className="p-4 font-bold">{pay.subject}</td>
                    <td className="p-4">{pay.amount}</td>
                    <td className="p-4 text-slate-500">{pay.date}</td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded-full">{pay.status}</span>
                    </td>
                    <td className="p-4">
                      <button className="text-[#1a6fc4] hover:text-[#0d3b72] flex items-center gap-1.5 text-xs font-bold">
                        <Download size={14} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ParentDashboard;