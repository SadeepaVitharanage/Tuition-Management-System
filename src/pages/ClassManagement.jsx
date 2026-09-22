import React, { useState } from 'react';
import { Plus, Clock, Users, BrainCircuit, MoreVertical, Search, GraduationCap, MapPin, X, AlertCircle } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';

const ClassManagement = () => {
  const [activeClass, setActiveClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [classes, setClasses] = useState([
    {
      id: 'CLS-001',
      subject: 'Mathematics',
      grade: 'Grade 11',
      status: 'Active',
      teacher: 'Mr. Rajitha Silva',
      location: 'Hall A',
      students: 28,
      capacity: 35,
      time: '4:00 PM',
      days: 'Mon, Wed',
      aiInsight: "High engagement detected. Consider opening a second parallel slot."
    },
    {
      id: 'CLS-002',
      subject: 'Physics',
      grade: 'A/L Science',
      status: 'Full',
      teacher: 'Ms. Nimal Perera',
      location: 'Lab 01',
      students: 30,
      capacity: 30,
      time: '2:00 PM',
      days: 'Tue, Thu',
      aiInsight: "Waitlist reached 12 students. Resource optimization recommended."
    },
    {
      id: 'CLS-003',
      subject: 'Chemistry',
      grade: 'A/L Science',
      status: 'Active',
      teacher: 'Dr. Sunil H.',
      location: 'Chemistry Wing',
      students: 15,
      capacity: 40,
      time: '8:30 AM',
      days: 'Sat',
      aiInsight: "Optimal load for personalized laboratory supervision."
    },
  ]);

  // --- ADDED VALIDATION LOGIC ---
  const handleAddClass = (e) => {
    e.preventDefault();
    setFormError('');
    
    const formData = new FormData(e.target);
    const subject = formData.get('subject').trim();
    const grade = formData.get('grade').trim();
    const teacher = formData.get('teacher').trim();
    const location = formData.get('location').trim();
    const capacity = parseInt(formData.get('capacity'));
    const time = formData.get('time').trim();
    const days = formData.get('days').trim();

    // 1. Basic Empty String Validation (beyond HTML 'required')
    if (!subject || !grade || !teacher || !location || !time || !days) {
      setFormError('All fields must be filled out correctly.');
      return;
    }

    // 2. Length Validation
    if (subject.length < 3) {
      setFormError('Subject name is too short (min 3 characters).');
      return;
    }

    // 3. Capacity Validation
    if (isNaN(capacity) || capacity <= 0) {
      setFormError('Capacity must be a number greater than 0.');
      return;
    }

    if (capacity > 500) {
      setFormError('Capacity exceeds maximum hall limits (500).');
      return;
    }

    const newClass = {
      id: `CLS-00${classes.length + 1}`,
      subject,
      grade,
      status: 'Active',
      teacher,
      location,
      students: 0,
      capacity,
      time,
      days,
      aiInsight: "New class created. Monitor initial enrollment."
    };

    setClasses([...classes, newClass]);
    setIsModalOpen(false);
    setFormError(''); // Clear error on success
  };

  return (
    <div className="flex bg-[#ddeeff] min-h-screen">
      <Sidebar activePage="class" />

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-[#b8d8f0] p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black font-serif uppercase text-[#0d3b72]">Class Allocation</h1>
          </div>
          <div className="flex gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-blue-300" size={16} />
              <input type="text" placeholder="Search Subject..." className="pl-10 pr-4 py-2 border border-[#b8d8f0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
            <button 
              onClick={() => {
                setFormError('');
                setIsModalOpen(true);
              }}
              className="bg-[#1a6fc4] text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#0d3b72] transition-all shadow-lg shadow-blue-500/20 uppercase tracking-tighter"
            >
              <Plus size={16} /> New Class
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(cls => (
              <div
                key={cls.id}
                onClick={() => setActiveClass(cls.id)}
                className={`bg-white border rounded-3xl p-6 transition-all cursor-pointer relative overflow-hidden group ${activeClass === cls.id
                    ? 'border-[#1a6fc4] shadow-xl ring-2 ring-blue-100 scale-[1.02]'
                    : 'border-[#b8d8f0] hover:border-blue-300 shadow-sm'
                  }`}
              >
                {/* Header of Card */}
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-2xl text-[#1a6fc4] group-hover:bg-[#0d3b72] group-hover:text-white transition-colors">
                    <GraduationCap size={24} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase mb-1 ${cls.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {cls.status}
                    </span>
                    <button className="text-gray-300 hover:text-gray-600"><MoreVertical size={16} /></button>
                  </div>
                </div>

                {/* Body */}
                <div className="mb-6">
                  <h3 className="text-xl font-black text-[#0d3b72] leading-none mb-1">{cls.subject}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{cls.grade}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-600 text-sm font-semibold">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Clock size={14} /></div>
                    <span>{cls.days} <span className="text-[#1a6fc4]">•</span> {cls.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 text-sm font-semibold">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Users size={14} /></div>
                    <span>{cls.teacher}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 text-sm font-semibold">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><MapPin size={14} /></div>
                    <span>{cls.location}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-1">
                    <span>Enrolled: {cls.students}/{cls.capacity}</span>
                    <span>{cls.capacity > 0 ? Math.round((cls.students / cls.capacity) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${cls.students >= cls.capacity ? 'bg-red-500' : 'bg-[#1a6fc4]'}`}
                      style={{ width: `${cls.capacity > 0 ? (cls.students / cls.capacity) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* AI Recommendation Footer */}
                <div className="bg-[#f0f7ff] p-4 rounded-2xl border border-blue-50 group-hover:bg-[#1a6fc4]/5 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <BrainCircuit size={14} className="text-[#1a6fc4] animate-pulse" />
                    <span className="text-[10px] font-black text-[#1a6fc4] uppercase tracking-widest">EduNest Insight</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#0d3b72] italic leading-relaxed">
                    "{cls.aiInsight}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* --- NEW CLASS MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-[#0d3b72]">Add New Class</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            {/* --- VISUAL VALIDATION MESSAGE --- */}
            {formError && (
              <div className="mb-5 bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-shake">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleAddClass} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Subject" name="subject" placeholder="e.g. Physics" />
                <Input label="Grade" name="grade" placeholder="e.g. Grade 12" />
              </div>
              <Input label="Teacher Name" name="teacher" placeholder="e.g. Dr. Smith" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Location/Hall" name="location" placeholder="e.g. Lab 01" />
                <Input label="Capacity" name="capacity" type="number" placeholder="30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Time" name="time" placeholder="e.g. 10:00 AM" />
                <Input label="Days" name="days" placeholder="e.g. Mon, Fri" />
              </div>
              
              <button type="submit" className="w-full bg-[#1a6fc4] text-white py-3 rounded-xl font-bold hover:bg-[#0d3b72] transition-colors shadow-lg shadow-blue-500/20 uppercase text-xs tracking-widest">
                Create Class
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
    <input 
      {...props}
      required
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
    />
  </div>
);

export default ClassManagement;