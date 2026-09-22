import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// ── Teal palette (matches LandingPage) ───────────────────────────
const C = {
  green:  '#0d6b7a',
  green2: '#00b8c8',
  gold:   '#F5C518',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData]       = useState({ email: '', password: '' });
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [visible, setVisible]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [successRole, setSuccessRole] = useState('');

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);
      setSuccessRole(user.role);
      setSuccess(true);
      setTimeout(() => {
        if      (user.role === 'admin')   navigate('/admin');
        else if (user.role === 'teacher') navigate('/teacher');
        else if (user.role === 'student') navigate('/student');
        else if (user.role === 'parent')  navigate('/parent');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  const roleLabels = {
    admin:   'Admin Portal',
    teacher: 'Teacher Portal',
    student: 'Student Portal',
    parent:  'Parent Portal',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', Roboto, sans-serif" }}>

      {/* ── Success Overlay ── */}
      {success && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(255,255,255,0.96)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{ position: 'relative', marginBottom: 32 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${i * 60}px`, height: `${i * 60}px`,
                borderRadius: '50%', border: `2px solid ${C.green}`,
                opacity: 0, animation: `ripple 1.8s ease-out ${i * 0.3}s infinite`,
              }}/>
            ))}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.green}, ${C.green2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 40px ${C.green}66`,
              animation: 'successPulse 1s ease-in-out infinite',
              position: 'relative', zIndex: 1,
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px', animation: 'slideUp 0.5s ease 0.2s both' }}>
            Login Successful!
          </h2>
          <p style={{ color: '#888', fontSize: 15, margin: '0 0 20px', animation: 'slideUp 0.5s ease 0.35s both' }}>
            Redirecting to {roleLabels[successRole]}...
          </p>
          <div style={{ width: 200, height: 4, background: '#F0F0F0', borderRadius: 4, overflow: 'hidden', animation: 'slideUp 0.5s ease 0.4s both' }}>
            <div style={{ height: '100%', borderRadius: 4, background: `linear-gradient(135deg,${C.green},${C.green2})`, animation: 'loadBar 1.8s ease forwards' }}/>
          </div>

          <style>{`
            @keyframes fadeIn    { from{opacity:0}to{opacity:1} }
            @keyframes ripple    { 0%{transform:translate(-50%,-50%) scale(0.8);opacity:0.6} 100%{transform:translate(-50%,-50%) scale(2.5);opacity:0} }
            @keyframes successPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
            @keyframes slideUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
            @keyframes loadBar   { from{width:0%} to{width:100%} }
          `}</style>
        </div>
      )}

      {/* ── Left Panel ── */}
      <div style={{
        flex: '0 0 50%',
        background: `linear-gradient(135deg, #081e22 0%, ${C.green} 60%, ${C.green2} 100%)`,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: 40,
        position: 'relative', overflow: 'hidden',
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-30px)',
        transition: 'opacity 0.9s ease, transform 0.9s ease',
      }}>
        {/* bg circles */}
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'rgba(245,197,24,0.1)' }}/>
        <div style={{ position:'absolute', bottom:-60, left:-60, width:250, height:250, borderRadius:'50%', background:'rgba(0,184,200,0.1)' }}/>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, zIndex:1 }}>
          <div style={{
            width:40, height:40, borderRadius:12,
            background:'rgba(245,197,24,0.2)', border:'2px solid rgba(245,197,24,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:C.gold, fontWeight:800, fontSize:18,
          }}>X</div>
          <span style={{ color:C.gold, fontWeight:800, fontSize:24 }}>XenEdu</span>
        </div>

        {/* Center */}
        <div style={{ zIndex:1 }}>
          <div style={{
            width:80, height:80, borderRadius:'50%',
            background:`radial-gradient(circle at 30% 30%, #00ffe0, ${C.green2} 40%, ${C.green})`,
            boxShadow:`0 0 40px ${C.green2}66`,
            marginBottom:32,
            animation:'ballPulse 3s ease-in-out infinite',
          }}/>

          <h2 style={{ color:'white', fontSize:36, fontWeight:800, margin:'0 0 16px', lineHeight:1.2 }}>
            Welcome back to<br/>
            <span style={{ color:C.gold }}>XenEdu</span>
          </h2>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:15, lineHeight:1.7, maxWidth:340 }}>
            Sri Lanka's smart A/L tuition management system with AI-powered learning.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:32 }}>
            {[
              { icon:'🤖', text:'AI-powered learning assistant' },
              { icon:'📊', text:'Real-time attendance tracking' },
              { icon:'👨‍👩‍👧', text:'Parent monitoring portal' },
            ].map((item,i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:12,
                background:'rgba(255,255,255,0.08)',
                borderRadius:12, padding:'12px 16px',
                border:'1px solid rgba(255,255,255,0.1)',
                opacity:   visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                transition: `opacity 0.7s ease ${0.4 + i * 0.15}s, transform 0.7s ease ${0.4 + i * 0.15}s`,
              }}>
                <span style={{ fontSize:20 }}>{item.icon}</span>
                <span style={{ color:'rgba(255,255,255,0.85)', fontSize:14, fontWeight:500 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13, margin:0, zIndex:1 }}>© 2026 XenEdu Mirigama</p>

        <style>{`
          @keyframes ballPulse {
            0%,100%{transform:scale(1);box-shadow:0 0 40px ${C.green2}66}
            50%{transform:scale(1.07);box-shadow:0 0 60px ${C.green2}aa}
          }
        `}</style>
      </div>

      {/* ── Right Panel — Form ── */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:40, background:'#FAFAF8',
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(30px)',
        transition: 'opacity 0.9s ease 0.1s, transform 0.9s ease 0.1s',
      }}>
        <div style={{ width:'100%', maxWidth:400 }}>

          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#888', fontSize:13, textDecoration:'none', marginBottom:40, transition:'color 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.color=C.green}
            onMouseLeave={e=>e.currentTarget.style.color='#888'}
          >← Back to home</Link>

          <h1 style={{ fontSize:30, fontWeight:800, color:'#1a1a1a', margin:'0 0 8px' }}>Sign in</h1>
          <p style={{ color:'#888', fontSize:15, margin:'0 0 36px' }}>Welcome back! Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#444', marginBottom:8 }}>Email Address</label>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="you@xenedu.com" required
                style={{ width:'100%', padding:'13px 16px', border:'1.5px solid #E8E8E8', borderRadius:12, fontSize:14, outline:'none', background:'white', transition:'border-color 0.2s', boxSizing:'border-box', color:'#1a1a1a', fontFamily:'inherit' }}
                onFocus={e=>e.target.style.borderColor=C.green}
                onBlur={e=>e.target.style.borderColor='#E8E8E8'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom:28 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#444', marginBottom:8 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPassword?'text':'password'} name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••" required
                  style={{ width:'100%', padding:'13px 48px 13px 16px', border:'1.5px solid #E8E8E8', borderRadius:12, fontSize:14, outline:'none', background:'white', transition:'border-color 0.2s', boxSizing:'border-box', color:'#1a1a1a', fontFamily:'inherit' }}
                  onFocus={e=>e.target.style.borderColor=C.green}
                  onBlur={e=>e.target.style.borderColor='#E8E8E8'}
                />
                <button type="button" onClick={()=>setShowPassword(!showPassword)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:16 }}>
                  {showPassword?'🙈':'👁️'}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign:'right', marginTop:-18, marginBottom:24 }}>
              <Link to="/forgot-password" style={{ color:'#888', fontSize:13, textDecoration:'none', transition:'color 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.color=C.green}
                onMouseLeave={e=>e.currentTarget.style.color='#888'}
              >Forgot your password?</Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width:'100%', padding:14,
                background: loading ? `linear-gradient(135deg,${C.green},${C.green2})` : C.green,
                color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:700,
                cursor: loading?'not-allowed':'pointer',
                boxShadow:`0 4px 15px ${C.green}4d`,
                transition:'all 0.3s ease', fontFamily:'inherit',
              }}
              onMouseEnter={e=>{ if(!loading) e.currentTarget.style.background='#0a505d'; }}
              onMouseLeave={e=>{ if(!loading) e.currentTarget.style.background=C.green; }}
            >
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  <span style={{ width:18, height:18, borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'white', animation:'spin 0.7s linear infinite', display:'inline-block' }}/>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>

          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:'#E8E8E8' }}/>
            <span style={{ color:'#BBB', fontSize:13 }}>or</span>
            <div style={{ flex:1, height:1, background:'#E8E8E8' }}/>
          </div>

          <p style={{ textAlign:'center', fontSize:14, color:'#888', margin:0 }}>
            New student?{' '}
            <Link to="/register" style={{ color:C.green, fontWeight:700, textDecoration:'none' }}>
              Apply for registration
            </Link>
          </p>

        </div>

        <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      </div>
    </div>
  );
};

export default LoginPage;
