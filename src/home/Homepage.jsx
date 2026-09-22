import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, CheckCircle, CreditCard, Bot, BarChart3, 
  ArrowRight, ShieldCheck, Star, Zap, Database, Lock, 
  ChevronRight, GraduationCap, School, BookOpen
} from 'lucide-react';

const Homepage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans text-[#0f2a4a] selection:bg-[#c9920a] selection:text-white">
      
      {/* ═══ NAVIGATION ═══ */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 px-[5%] ${
        scrolled 
          ? 'bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#d0e4f7] shadow-lg py-3' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-xl shadow-md transition-all duration-500 ${
              scrolled ? 'bg-[#0d3b72] text-white' : 'bg-white text-[#0d3b72]'
            }`}>
              E
            </div>
            <span className={`text-2xl font-serif font-bold transition-colors duration-500 ${
              scrolled ? 'text-[#0d3b72]' : 'text-white'
            }`}>
              Edu<span className={scrolled ? 'text-[#1a6fc4]' : 'text-[#f0b429]'}>Nest</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {['Features', 'How It Works', 'User Roles', 'AI Assistant'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(/\s+/g, '')}`} 
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                  scrolled ? 'text-[#2d5a8a] hover:text-[#0d3b72]' : 'text-white/70 hover:text-white'
                }`}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-5">
            {/* FIXED: Changed button to Link */}
            <Link 
              to="/login"
              className={`text-xs font-black uppercase tracking-widest transition-colors duration-500 ${
                scrolled ? 'text-[#0d3b72]' : 'text-white/80 hover:text-white'
              }`}
            >
              Log In
            </Link>
            {/* FIXED: Changed button to Link */}
            <Link 
              to="/login"
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-tight transition-all shadow-lg text-center ${
                scrolled 
                  ? 'bg-[#0d3b72] text-white hover:bg-[#1a6fc4]' 
                  : 'bg-[#f0b429] text-[#0d3b72] hover:bg-white'
              }`}
            >
              Get Started <ArrowRight size={14} className="inline ml-1" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0d3b72]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-8">
            <div className="w-1.5 h-1.5 bg-[#f0b429] rounded-full shadow-[0_0_8px_#f0b429]" />
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-[0.2em]">ITP_IT_16 • SLIIT Project 2026</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-[1.1] mb-8">
            The <span className="italic font-normal text-[#5fa8e8]">smarter</span> way to manage your<br />
            <span className="text-[#f0b429]">tuition class</span> — end to end
          </h1>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            EduNest brings together student enrollment, class scheduling, attendance tracking, fee management, and an AI-powered academic assistant.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            {/* FIXED: Changed button to Link */}
            <Link 
              to="/login"
              className="w-full sm:w-auto bg-[#f0b429] text-[#0d3b72] px-10 py-4 rounded-full font-extrabold text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all text-center"
            >
              🚀 Get Started Free
            </Link>
            <a 
              href="#features"
              className="w-full sm:w-auto border border-white/30 text-white px-10 py-4 rounded-full font-bold text-sm hover:bg-white/10 transition-all text-center"
            >
              ↓ Explore Features
            </a>
          </div>
        </div>

        {/* ═══ HERO STATS ═══ */}
        <div className="relative z-10 w-full border-t border-white/10 bg-black/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 py-8">
            <StatItem num="500+" label="Students Managed" />
            <StatItem num="05+" label="Core Modules" />
            <StatItem num="24/7" label="AI Assistant" />
            <StatItem num="99%" label="Uptime Guarantee" />
            <StatItem num="0 Paper" label="Fully Digital" />
          </div>
        </div>
      </section>

      {/* ═══ CORE MODULES ═══ */}
      <section id="features" className="py-24 px-[5%] max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="bg-[#e8f2fc] text-[#1a6fc4] border border-[#d0e4f7] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">✦ Core Modules</span>
          <h2 className="text-4xl font-serif font-bold text-[#0d3b72] mt-4">Everything your tuition class <span className="italic text-[#1a6fc4]">needs</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon="👨‍🎓" bgColor="bg-[#e8f2fc]" accent="border-blue-500"
            title="Student & Enrollment" 
            desc="Centralized records with parent details, academic profiles, and multi-class enrollment tracking."
            list={['Manage student records', 'Multi-class enrollment', 'Detailed profiles']}
          />
          <FeatureCard 
            icon="📅" bgColor="bg-[#fef3c7]" accent="border-yellow-500"
            title="Class & Scheduling" 
            desc="Organize classes, allocate teachers by expertise, manage timetables, and handle cancellations."
            list={['Manage timetables', 'Teacher allocation', 'Rescheduling alerts']}
          />
          <FeatureCard 
            icon="✅" bgColor="bg-[#dcfce7]" accent="border-green-500"
            title="Attendance & Engagement" 
            desc="Mark attendance digitally, auto-calculate percentages, and alert parents when thresholds drop."
            list={['Digital session marking', 'Auto-percentages', 'Absence alerts']}
          />
        </div>
      </section>

      {/* ═══ USER ROLES ═══ */}
      <section id="userroles" className="py-24 px-[5%] bg-[#f3ede3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#0d3b72] text-[10px] font-black uppercase tracking-widest">👥 User Roles</span>
            <h2 className="text-4xl font-serif font-bold text-[#0d3b72] mt-4">Built for <span className="italic text-[#1a6fc4]">everyone</span> in your class</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RoleCard 
              icon="🛡️" name="Administrator" tag="Full System Access" color="bg-[#0d3b72]"
              perms={['Manage all students', 'Configure teachers', 'Payment & Fee control', 'AI Management', 'Full Analytics']}
            />
            <RoleCard 
              icon="👩‍🏫" name="Teacher" tag="Class Management" color="bg-[#065f46]"
              perms={['Mark class attendance', 'View class schedules', 'Student profiles', 'Performance notes', 'Class reports']}
            />
            <RoleCard 
              icon="🎓" name="Student / Parent" tag="Personal Access" color="bg-[#7c2d12]"
              perms={['Attendance records', 'Fee status & Receipts', 'View class schedules', 'AI Academic Assistant', 'Exam notifications']}
            />
          </div>
        </div>
      </section>

      {/* ═══ AI ACADEMIC CHATBOT SECTION ═══ */}
      <section id="aiassistant" className="py-24 px-[5%] bg-[#faf7f2]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="bg-[#0a2f5c] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <span className="text-white font-serif font-bold">EduNest AI</span>
              <div className="flex items-center gap-2 text-[10px] text-green-400 font-bold uppercase tracking-widest">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Online
              </div>
            </div>
            <div className="space-y-4">
              <ChatBubble type="ai" text="👋 Hi Kavindu! Your Feb attendance is 91.7%. Above requirements! ✅" label="DB Query" />
              <ChatBubble type="user" text="Explain Newton's Second Law." />
              <ChatBubble type="ai" text="Newton's 2nd Law: F = ma. Force equals mass times acceleration. 💡" label="Claude AI" />
            </div>
          </div>

          <div>
            <span className="text-[#c9920a] font-black text-[10px] uppercase tracking-widest">🤖 AI-Powered</span>
            <h2 className="text-4xl font-serif font-bold text-[#0d3b72] mt-4 mb-6">Meet your 24/7 <span className="italic">AI Academic</span> Assistant</h2>
            <div className="space-y-6">
              <FeatureList icon="💬" title="Instant System Queries" text="Real-time answers about fees, attendance and schedules pulled from the DB." />
              <FeatureList icon="📘" title="Academic Subject Support" text="Claude AI explains complex concepts in Physics, Math and Biology." />
              <FeatureList icon="🧠" title="Hybrid Intelligence" text="Cost-efficient engine using rule-based and AI models for 100% accuracy." />
            </div>
            {/* FIXED: Link added to AI Demo button */}
            <Link to="/login" className="mt-8 inline-block px-8 py-3 bg-[#0d3b72] text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#1a6fc4] transition-all">
              Try AI Assistant Demo →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#0a2f5c] pt-24 pb-12 px-[5%] text-white/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-white/5">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white font-serif font-bold">E</div>
              <span className="text-xl font-serif font-bold text-white tracking-tight">EduNest</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">A comprehensive web-based Tuition Class Management System built for Sri Lanka's education sector.</p>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Project ID: ITP_IT_16</div>
          </div>
          
          <div>
             <h5 className="text-[10px] font-black uppercase text-white tracking-[0.3em] mb-6">Modules</h5>
             <ul className="text-sm space-y-3 font-medium">
                {['Student Management', 'Class & Scheduling', 'Attendance Tracking', 'Fee & Payments', 'AI Assistant'].map(l => (
                  <li key={l} className="hover:text-white transition-colors cursor-pointer">{l}</li>
                ))}
             </ul>
          </div>

          <div>
             <h5 className="text-[10px] font-black uppercase text-white tracking-[0.3em] mb-6">User Portals</h5>
             <ul className="text-sm space-y-3 font-medium">
                {['Administrator Portal', 'Teacher Portal', 'Student Portal', 'Parent Access'].map(l => (
                  <li key={l} className="hover:text-white transition-colors cursor-pointer">{l}</li>
                ))}
             </ul>
          </div>

          <div>
             <h5 className="text-[10px] font-black uppercase text-white tracking-[0.3em] mb-6">Project Team</h5>
             <ul className="text-sm space-y-2 font-medium">
                <li>Bogahawaththa P.B.P.A</li>
                <li>Madhubhashini D.V.S</li>
                <li>Senawirathne R.M.K.A</li>
                <li>Sewmini A.D.B</li>
                <li>Kaveesha K.A.D</li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/20">
           <p>© 2026 EduNest — SLIIT Faculty of Computing</p>
           <p>Built with ❤️ for Sri Lanka's tuition institutes</p>
        </div>
      </footer>
    </div>
  );
};

/* ═══ REUSABLE COMPONENTS ═══ */

const StatItem = ({ num, label }) => (
  <div className="text-center p-4 border-r last:border-0 border-white/10">
    <div className="text-2xl md:text-3xl font-serif font-bold text-white">{num}</div>
    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{label}</div>
  </div>
);

const FeatureCard = ({ icon, bgColor, title, desc, list, accent }) => (
  <div className={`bg-white border-1.5 border-[#d0e4f7] p-8 rounded-2xl border-t-4 ${accent} group shadow-sm`}>
    <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center text-2xl mb-6`}>
      {icon}
    </div>
    <h3 className="text-lg font-serif font-bold text-[#0d3b72] mb-3">{title}</h3>
    <p className="text-xs text-[#6b92b8] leading-relaxed mb-6">{desc}</p>
    <ul className="space-y-2">
      {list.map((item, i) => (
        <li key={i} className="text-[11px] font-bold text-[#2d5a8a] flex items-center gap-2">
          <div className="w-1 h-1 bg-green-500 rounded-full" /> {item}
        </li>
      ))}
    </ul>
  </div>
);

const RoleCard = ({ icon, name, tag, color, perms }) => (
  <div className="bg-white rounded-2xl overflow-hidden border border-[#d0e4f7] hover:shadow-xl transition-all h-full flex flex-col">
    <div className={`${color} p-6 flex flex-col items-start gap-4`}>
       <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center text-2xl">{icon}</div>
       <div>
         <div className="text-white font-serif font-bold text-lg">{name}</div>
         <div className="text-white/40 text-[9px] font-black uppercase tracking-widest">{tag}</div>
       </div>
    </div>
    <div className="p-6 space-y-3 flex-grow">
      {perms.map((p, i) => (
        <div key={i} className="flex items-center gap-3 text-xs font-semibold text-[#0d3b72]">
           <CheckCircle size={14} className="text-[#1a6fc4]" /> {p}
        </div>
      ))}
    </div>
    <div className="p-6 pt-0">
      {/* FIXED: Changed to Link for immediate navigation */}
      <Link 
        to="/login"
        className="block w-full text-center py-3 bg-[#faf7f2] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#0d3b72] hover:text-white transition-all"
      >
        Open Portal →
      </Link>
    </div>
  </div>
);

const ChatBubble = ({ type, text, label }) => (
  <div className={`flex flex-col ${type === 'user' ? 'items-end' : 'items-start'}`}>
    <div className={`max-w-[85%] p-3 rounded-xl text-xs ${
      type === 'user' ? 'bg-[#1a6fc4] text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'
    }`}>
      {text}
      {label && <div className="mt-2 text-[8px] font-black uppercase tracking-[0.1em] opacity-40">{label}</div>}
    </div>
  </div>
);

const FeatureList = ({ icon, title, text }) => (
  <div className="flex gap-4 items-start">
    <div className="w-10 h-10 bg-white shadow-md rounded-xl flex items-center justify-center text-xl shrink-0">{icon}</div>
    <div>
      <h4 className="text-sm font-bold text-[#0d3b72] mb-1">{title}</h4>
      <p className="text-xs text-[#6b92b8] leading-relaxed">{text}</p>
    </div>
  </div>
);

export default Homepage;