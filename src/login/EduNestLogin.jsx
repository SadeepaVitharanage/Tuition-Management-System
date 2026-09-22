import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Loader2, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';

const USERS = [
  {
    email: "admin@xenedu.com",
    password: "admin123",
    role: "Administrator",
    name: "Super Admin",
    icon: "🛡️",
    badge: "Full System Access",
    color: "#0d3b72"
  },
  {
    email: "teacher@edunest.lk",
    password: "Teacher@2026",
    role: "Teacher",
    name: "Ms. Nadeeka K.",
    icon: "👩‍🏫",
    badge: "Class Management",
    color: "#065f46"
  },
  {
    email: "student@edunest.lk",
    password: "Student@2026",
    role: "Student",
    name: "Kavindu Perera",
    icon: "🎓",
    badge: "Student Portal",
    color: "#7c2d12"
  },
  {
    email: "parent@edunest.lk",
    password: "Parent@2026",
    role: "Parent",
    name: "Mr. Perera",
    icon: "👨‍👩‍👧",
    badge: "Parent Portal",
    color: "#1e40af"
  }
];

const EduNestLogin = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Track specific fields for red border highlighting
  const [fieldErrors, setFieldErrors] = useState({ email: false, password: false });

  const handleAutoFill = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setError('');
    setFieldErrors({ email: false, password: false });
  };

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isEmailValid = emailRegex.test(email);
    let isPasswordValid = password.length >= 6;

    setFieldErrors({
      email: !isEmailValid,
      password: !isPasswordValid
    });

    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!isPasswordValid) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    // Check validation before showing loader
    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      const user = USERS.find(u => u.email === email && u.password === password);

      if (user) {
        setSuccess(true);
        setIsLoading(false);
        setAuth({ _id: 'dummy', name: user.name, email: user.email, role: user.role.toLowerCase() }, 'dummy-access-token', 'dummy-refresh-token');

        setTimeout(() => {
          if (user.role === "Administrator") {
            navigate('/admin-dashboard');
          } else if (user.role === "Student") {
            navigate('/dashboard');
          } else if (user.role === "Teacher") {
            navigate('/teacher-portal');
          } else if (user.role === "Parent") {
            navigate('/parent-dashboard');
          } else {
            navigate('/');
          }
        }, 2000);

      } else {
        setError('Invalid credentials. Please check your email and password.');
        setFieldErrors({ email: true, password: true });
        setIsLoading(false);
      }
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0d3b72] flex items-center justify-center p-6">
        <div className="text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Welcome Back!</h2>
          <p className="text-white/60">Redirecting to your secure dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col lg:flex-row">
      {/* Left Side: Aesthetic Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0d3b72] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
        <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="relative z-10 max-w-md text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <ShieldCheck size={32} className="text-[#f0b429]" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-white mb-6 leading-tight">
            Secure Access to <br /><span className="text-[#f0b429]">EduNest</span> Portals
          </h1>
          <p className="text-white/60 leading-relaxed mb-8">
            Manage your academic journey with Sri Lanka's most advanced tuition management system.
          </p>
          
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Quick Demo Access</p>
            {USERS.map((u) => (
              <button 
                key={u.role}
                onClick={() => handleAutoFill(u)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{u.icon}</span>
                  <div className="text-left">
                    <div className="text-white text-xs font-bold">{u.role}</div>
                    <div className="text-white/40 text-[10px]">{u.name}</div>
                  </div>
                </div>
                <div className="text-white/20 group-hover:text-[#f0b429] transition-colors">
                  <ArrowLeft size={14} className="rotate-180" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
             <span className="text-2xl font-serif font-bold text-[#0d3b72]">Edu<span className="text-[#f0b429]">Nest</span></span>
          </div>

          <h2 className="text-2xl font-serif font-bold text-[#0d3b72] mb-2">Login to Portal</h2>
          <p className="text-[#6b92b8] text-sm mb-8">Enter your credentials to continue.</p>

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#0d3b72] mb-2">Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.email ? 'text-red-500' : 'text-[#6b92b8]'}`} size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if(error) setError('');
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-white border ${fieldErrors.email ? 'border-red-500' : 'border-[#d0e4f7]'} rounded-xl focus:ring-2 focus:ring-[#0d3b72] outline-none transition-all text-sm`}
                  placeholder="name@edunest.lk"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0d3b72]">Password</label>
                <a href="#" className="text-[10px] font-bold text-[#1a6fc4] hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${fieldErrors.password ? 'text-red-500' : 'text-[#6b92b8]'}`} size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if(error) setError('');
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-white border ${fieldErrors.password ? 'border-red-500' : 'border-[#d0e4f7]'} rounded-xl focus:ring-2 focus:ring-[#0d3b72] outline-none transition-all text-sm`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0d3b72] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#1a6fc4] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Secure Login'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-[#6b92b8]">
            Don't have an account? <span className="text-[#0d3b72] font-bold cursor-pointer hover:underline">Contact Administrator</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EduNestLogin;