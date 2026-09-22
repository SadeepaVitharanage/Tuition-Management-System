import React, { useState } from 'react';
import { Search, UserPlus, Filter, MoreVertical, Download, Mail, Phone, GraduationCap, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const [students, setStudents] = useState([
    { id: 'STU-001', name: "Kavindu Perera", grade: "Grade 11", email: "kavindu.p@gmail.com", phone: "077 123 4567", status: "Active", attendance: "94%", performance: "Excellent" },
    { id: 'STU-002', name: "Nethmi Silva", grade: "Grade 11", email: "nethmi.s@outlook.com", phone: "071 987 6543", status: "Active", attendance: "88%", performance: "Good" },
    { id: 'STU-003', name: "Ruwan Gamage", grade: "A/L Science", email: "ruwan.g@yahoo.com", phone: "075 444 3322", status: "Inactive", attendance: "45%", performance: "At Risk" },
    { id: 'STU-004', name: "Samanthi P.", grade: "Grade 10", email: "samanthi.p@gmail.com", phone: "072 111 2233", status: "Active", attendance: "98%", performance: "Excellent" },
  ]);

  const handleRegister = (e) => {
    e.preventDefault();
    setFormError("");

    const formData = new FormData(e.target);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const phone = formData.get('phone').trim();
    const attendance = formData.get('attendance');
    const grade = formData.get('grade');

    // Validation
    if (name.length < 3) return setFormError("Name must be at least 3 characters.");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setFormError("Please enter a valid email address.");

    const phoneRegex = /^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|2|3|4|5|7|9)|7(0|1|2|4|5|6|7|8)\d)\d{6}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) return setFormError("Enter a valid phone number.");

    if (attendance < 0 || attendance > 100) return setFormError("Attendance must be between 0 and 100.");

    const newStudent = {
      id: `STU-00${students.length + 1}`,
      name,
      grade,
      email,
      phone,
      status: "Active",
      attendance: `${attendance}%`,
      performance: attendance > 75 ? "Excellent" : attendance > 50 ? "Good" : "At Risk"
    };

    setStudents([...students, newStudent]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex bg-[#ddeeff] min-h-screen">
      <Sidebar activePage="student" />
      
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-[#b8d8f0] p-6 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-black font-serif uppercase text-[#0d3b72]">Student Registry</h1>
            <p className="text-[11px] text-[#6b92b8] font-bold uppercase tracking-widest">Senawirathne R.M.K.A — IT24101990</p>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#b8d8f0] text-[#0d3b72] rounded-xl text-xs font-black hover:bg-gray-50 transition-all">
                <Download size={14}/> EXPORT DATA
             </button>
             <button 
              onClick={() => { setFormError(""); setIsModalOpen(true); }}
              className="bg-[#0d3b72] text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#1a6fc4] transition-all shadow-lg shadow-blue-900/20 uppercase tracking-tighter"
             >
                <UserPlus size={16}/> Register Student
             </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 space-y-6">
          
          {/* Filters and Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-3 text-blue-300" size={18} />
              <input 
                type="text" 
                placeholder="Search by Name, ID or Grade..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#b8d8f0] rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#b8d8f0] rounded-2xl text-[10px] font-black uppercase text-[#0d3b72] hover:bg-blue-50 transition-all shadow-sm">
                <Filter size={14}/> Filter
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#b8d8f0] rounded-2xl text-[10px] font-black uppercase text-[#0d3b72] hover:bg-blue-50 transition-all shadow-sm">
                Sort A-Z
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-[#b8d8f0] rounded-[2rem] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-[#f8fbff] text-[10px] font-black uppercase text-[#6b92b8] border-b border-[#f0f7ff]">
                <tr>
                  <th className="px-8 py-5">Profile</th>
                  <th className="px-8 py-5">Student ID</th>
                  <th className="px-8 py-5">Contact Details</th>
                  <th className="px-8 py-5">Performance</th>
                  <th className="px-8 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f7ff]">
                {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
                  <tr key={student.id} className="hover:bg-[#f0f7ff]/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0d3b72] to-[#1a6fc4] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-100">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#0d3b72]">{student.name}</p>
                          <div className="flex items-center gap-1">
                            <GraduationCap size={10} className="text-[#1a6fc4]"/>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{student.grade}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-mono text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                        {student.id}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500">
                          <Mail size={12} className="text-blue-300" /> {student.email}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500">
                          <Phone size={12} className="text-blue-300" /> {student.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                         <div className="flex justify-between items-center w-24">
                            <span className="text-[9px] font-black uppercase text-gray-400">Attendance</span>
                            <span className="text-[10px] font-black text-[#0d3b72]">{student.attendance}</span>
                         </div>
                         <div className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-block w-fit ${
                           student.performance === 'Excellent' ? 'bg-green-100 text-green-700' : 
                           student.performance === 'At Risk' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                         }`}>
                           {student.performance.toUpperCase()}
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button className="p-2 text-gray-300 hover:text-[#0d3b72] hover:bg-blue-50 rounded-xl transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Insight Footer */}
          <div className="bg-[#0d3b72] p-6 rounded-[2rem] text-white flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                   <ShieldCheck size={24} className="text-blue-300" />
                </div>
                <div>
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">EduNest Data Security</p>
                   <p className="text-[11px] font-medium opacity-70">Student records are end-to-end encrypted and optimized for AI-driven performance tracking.</p>
                </div>
             </div>
             <button className="bg-white text-[#0d3b72] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shrink-0">
                Audit Registry
             </button>
          </div>

        </div>
      </main>

      {/* --- REGISTRATION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0d3b72]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-[#b8d8f0] animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-[#0d3b72] uppercase font-serif">Register Student</h2>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Add new entry to registry</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            {formError && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase">
                <AlertCircle size={18} />
                {formError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase px-1">Full Name</label>
                <input name="name" required className="w-full px-5 py-3.5 bg-gray-50 border border-[#b8d8f0] rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-200 transition-all" placeholder="e.g. Amal Silva" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase px-1">Grade</label>
                  <select name="grade" className="w-full px-5 py-3.5 bg-gray-50 border border-[#b8d8f0] rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-200 transition-all appearance-none">
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                    <option>A/L Science</option>
                    <option>A/L Commerce</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase px-1">Attendance %</label>
                  <input name="attendance" type="number" required className="w-full px-5 py-3.5 bg-gray-50 border border-[#b8d8f0] rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-200 transition-all" placeholder="0-100" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase px-1">Email Address</label>
                <input name="email" type="email" required className="w-full px-5 py-3.5 bg-gray-50 border border-[#b8d8f0] rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-200 transition-all" placeholder="name@example.com" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase px-1">Contact Number</label>
                <input name="phone" required className="w-full px-5 py-3.5 bg-gray-50 border border-[#b8d8f0] rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-200 transition-all" placeholder="07X XXX XXXX" />
              </div>
              
              <button type="submit" className="w-full bg-[#0d3b72] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#1a6fc4] transition-all shadow-xl shadow-blue-900/10 mt-4">
                Confirm Registration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;