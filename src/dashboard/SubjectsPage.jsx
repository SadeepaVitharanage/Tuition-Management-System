import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle } from 'lucide-react';

const SubjectsPage = () => {
  const { gradeId } = useParams();
  const navigate = useNavigate();

  const subjects = [
    { name: "Mathematics", icon: "📐", lessons: "24 Lessons", teacher: "Mr. Samantha P.", price: "LKR 2,500" },
    { name: "Science", icon: "🧬", lessons: "18 Lessons", teacher: "Ms. Nadeeka K.", price: "LKR 2,500" },
    { name: "English Language", icon: "📚", lessons: "15 Lessons", teacher: "Mr. John Doe", price: "LKR 2,000" },
    { name: "History", icon: "📜", lessons: "12 Lessons", teacher: "Ms. Perera", price: "LKR 1,500" },
    { name: "ICT", icon: "💻", lessons: "20 Lessons", teacher: "Mr. Kaveesha", price: "LKR 3,000" },
  ];

  // Helper function to handle navigation
  const handleNavigateToEnroll = (subjectName) => {
    const formattedName = subjectName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/enroll/${gradeId}/${formattedName}`);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[#6b92b8] hover:text-[#0d3b72] transition-colors mb-8 font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Grades
        </button>

        <div className="mb-10">
          <span className="bg-[#fef3c7] text-[#c9920a] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Available Classes</span>
          <h1 className="text-4xl font-serif font-bold text-[#0d3b72] mt-2">Grade {gradeId} Subjects</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((sub, index) => (
            <div 
              key={index} 
              // UPDATED: onClick moved here to the container
              onClick={() => handleNavigateToEnroll(sub.name)}
              className="bg-white border border-[#d0e4f7] p-6 rounded-2xl flex items-center justify-between group hover:border-[#f0b429] transition-all cursor-pointer hover:shadow-lg"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-[#faf7f2] rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {sub.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0d3b72]">{sub.name}</h3>
                  <p className="text-xs text-[#6b92b8]">{sub.teacher} • {sub.lessons}</p>
                  <p className="text-sm font-bold text-[#1a6fc4] mt-1">{sub.price}</p>
                </div>
              </div>
              <div className="w-10 h-10 bg-[#0d3b72] text-white rounded-full flex items-center justify-center group-hover:bg-[#f0b429] transition-colors">
                <PlayCircle size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage;