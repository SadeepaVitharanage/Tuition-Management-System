import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ZenyaChat from '../../components/common/ZenyaChat';

// ── Colors ────────────────────────────────────────────────────────
const C = {
  green:  '#0d6b7a',
  green2: '#00b8c8',
  greenPale: '#e4f5f7',
  greenBorder: '#b8e4ea',
  gold:   '#F5C518',
  dark:   '#1a1a1a',
  muted:  '#888',
  border: '#F0F0F0',
  bg:     '#FAFAF8',
};

// ── Data ──────────────────────────────────────────────────────────
const stats = [
  { number: '500+', label: 'Students Enrolled' },
  { number: '50+',  label: 'Expert Teachers' },
  { number: '30+',  label: 'Classes Available' },
  { number: '14+',  label: 'Subjects Offered' },
];

const subjects = [
  { name: 'Physics',              icon: '⚛️', teachers: 3 },
  { name: 'Combined Mathematics', icon: '📐', teachers: 4 },
  { name: 'Chemistry',            icon: '🧪', teachers: 3 },
  { name: 'Biology',              icon: '🧬', teachers: 3 },
  { name: 'Economics',            icon: '📊', teachers: 2 },
  { name: 'Accounting',           icon: '📒', teachers: 2 },
  { name: 'ICT',                  icon: '💻', teachers: 2 },
  { name: 'English',              icon: '📝', teachers: 3 },
];

const steps = [
  { number: '01', title: 'Register Online',  desc: "Fill out our simple registration form with your details and your parent's information." },
  { number: '02', title: 'Admin Approval',   desc: 'Our admin reviews your application and sends your login credentials via email.' },
  { number: '03', title: 'Browse & Enroll',  desc: 'Login to your portal, browse available classes and enroll in the subjects you need.' },
];

const whyItems = [
  { icon: '🤖', title: 'AI-Powered Learning',  desc: 'Personal AI tutor available 24/7 for subject help and study guidance.' },
  { icon: '📱', title: 'Barcode Attendance',    desc: 'Fast and accurate attendance tracking using student ID barcodes.' },
  { icon: '💳', title: 'Easy Fee Payments',     desc: 'Pay fees at the institute counter with barcode scan — instant receipt.' },
  { icon: '👨‍👩‍👧', title: 'Parent Monitoring',  desc: 'Parents get real-time access to attendance, fees and class schedules.' },
];

const faqs = [
  { q: 'How do I register at XenEdu?',      a: "Click the Register button, fill in the online form, and wait for admin approval. You'll receive your login credentials via email." },
  { q: 'What subjects are available?',       a: 'We offer Physics, Combined Mathematics, Chemistry, Biology, Economics, Accounting, ICT, English and more for A/L students.' },
  { q: 'What are the class fees?',           a: 'Fees vary by subject and class. Typically between Rs. 2,000 – Rs. 3,500 per month. Contact us for specific pricing.' },
  { q: 'How does attendance work?',          a: 'We use a barcode-based attendance system. Your student ID card has a barcode that teachers scan at each session.' },
  { q: 'Can parents monitor their child?',   a: 'Yes! Parents get their own portal to monitor attendance, fee payments and enrolled classes in real-time.' },
  { q: 'What is the AI tutor?',              a: 'XenEdu has a built-in AI learning platform that helps students with subject explanations and study tips.' },
];

const testimonials = [
  { text: "XenEdu completely changed how I study. The A/L maths classes are structured perfectly — I went from C to A in one term.", name: 'Dilani R.',         grade: 'Grade 13, Colombo', initial: 'D' },
  { text: "Finding a qualified Economics teacher was impossible until XenEdu. My daughter now attends live sessions every week.",       name: 'Mrs. Jayawardena', grade: 'Parent, Kandy',     initial: 'J' },
  { text: "The Sinhala medium physics classes are so clear. I can watch recordings when I miss a session. Best investment for A/L.",   name: 'Tharaka M.',       grade: 'Grade 12, Galle',   initial: 'T' },
];

const teacherCards = [
  { name: 'Samanthi Jayawardena', subject: 'Biology',      icon: '🧬', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&crop=face', bg: '#0d6b7a', accent: '#F5C518' },
  { name: 'Kamal Fernando',       subject: 'Physics',      icon: '⚛️', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face', bg: '#00b8c8', accent: '#ffffff' },
  { name: 'Nuwan Perera',         subject: 'Mathematics',  icon: '📐', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face', bg: '#F5C518', accent: '#0d6b7a' },
  { name: 'Harshani De Silva',    subject: 'Accounting',   icon: '📒', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&crop=face', bg: '#0a505d', accent: '#F5C518' },
  { name: 'Priya Bandara',        subject: 'Chemistry',    icon: '🧪', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face', bg: '#00cec9', accent: '#ffffff' },
  { name: 'Roshan Silva',         subject: 'Economics',    icon: '📊', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face', bg: '#0d6b7a', accent: '#F5C518' },
];

// ── Rolling Card ──────────────────────────────────────────────────
const CardFace = ({ teacher, size }) => {
  const lg = size === 'large';
  return (
    <>
      <img src={teacher.photo} alt={teacher.name}
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:'65%', zIndex:1,
        background:`linear-gradient(to top, ${teacher.bg}F5, transparent)`,
      }}/>
      <div style={{ position:'absolute', bottom: lg?28:20, left:0, right:0, zIndex:2, textAlign:'center', padding:'0 14px' }}>
        <p style={{ margin:'0 0 4px', fontSize: lg?19:17, fontWeight:800, color:teacher.accent }}>
          {teacher.name.split(' ')[0]}
        </p>
        <p style={{ margin:'0 0 10px', fontSize: lg?14:13, fontWeight:600, color:'rgba(255,255,255,0.8)' }}>
          {teacher.name.split(' ').slice(1).join(' ')}
        </p>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:6,
          background:'rgba(255,255,255,0.2)', backdropFilter:'blur(8px)',
          borderRadius:14, padding: lg?'8px 18px':'6px 14px',
          border:'1px solid rgba(255,255,255,0.3)',
        }}>
          <span style={{ fontSize: lg?17:15 }}>{teacher.icon}</span>
          <span style={{ fontSize: lg?14:13, fontWeight:700, color:'white' }}>{teacher.subject}</span>
        </div>
      </div>
    </>
  );
};

const RollingCard = ({ interval, startIndex, width, height, size }) => {
  const [cur, setCur]     = useState(startIndex % teacherCards.length);
  const [nxt, setNxt]     = useState((startIndex + 1) % teacherCards.length);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      const n = (cur + 1) % teacherCards.length;
      setNxt(n); setRolling(true);
      setTimeout(() => { setCur(n); setRolling(false); }, 520);
    }, interval);
    return () => clearInterval(t);
  }, [cur, interval]);

  const ease   = 'cubic-bezier(0.4,0,0.2,1)';
  const border = size === 'large' ? '4px solid white' : '3px solid white';
  const shadow = size === 'large'
    ? '0 28px 72px rgba(13,107,122,0.3)'
    : '0 20px 56px rgba(0,0,0,0.18)';

  const layerStyle = (isTop) => ({
    position:'absolute', inset:0,
    background: isTop ? teacherCards[cur].bg : teacherCards[nxt].bg,
    transform:  isTop
      ? (rolling ? 'translateY(-100%)' : 'translateY(0)')
      : (rolling ? 'translateY(0)'     : 'translateY(100%)'),
    transition: rolling ? `transform 0.52s ${ease}` : 'none',
    zIndex: isTop ? 2 : 1,
  });

  return (
    <div style={{ width, height, position:'relative', overflow:'hidden', borderRadius:28, boxShadow:shadow, border, flexShrink:0 }}>
      <div style={layerStyle(true)}><CardFace  teacher={teacherCards[cur]} size={size}/></div>
      <div style={layerStyle(false)}><CardFace teacher={teacherCards[nxt]} size={size}/></div>
    </div>
  );
};

// ── Hero Right ────────────────────────────────────────────────────
const HeroRight = ({ visible }) => (
  <div style={{
    flex:'0 0 50%', zIndex:1, position:'relative',
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    minHeight:600,
    opacity:   visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : 'translateX(40px)',
    transition:'opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s',
  }}>
    <div style={{ position:'absolute', top:'5%',   right:'5%', width:300, height:300, borderRadius:'50%', background:C.gold,  opacity:0.08, zIndex:0, pointerEvents:'none' }}/>
    <div style={{ position:'absolute', bottom:'5%', left:'5%', width:240, height:240, borderRadius:'50%', background:C.green, opacity:0.07, zIndex:0, pointerEvents:'none' }}/>

    <div style={{ position:'relative', zIndex:1, marginBottom:32 }}>
      <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.greenPale, border:`1px solid ${C.greenBorder}`, borderRadius:20, padding:'8px 20px' }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:C.green2, boxShadow:`0 0 0 3px ${C.green2}33` }}/>
        <span style={{ color:C.green, fontSize:13, fontWeight:700 }}>Meet Our Expert Teachers</span>
      </div>
    </div>

    <div style={{ position:'relative', zIndex:1, display:'flex', gap:20, alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ transform:'translateY(40px)' }}>
        <RollingCard interval={2500} startIndex={0} width={200} height={320} size="small"/>
      </div>
      <div style={{ transform:'translateY(-24px)' }}>
        <RollingCard interval={3500} startIndex={2} width={215} height={420} size="large"/>
      </div>
      <div style={{ transform:'translateY(40px)' }}>
        <RollingCard interval={4500} startIndex={4} width={200} height={320} size="small"/>
      </div>
    </div>

    <p style={{ position:'relative', zIndex:1, marginTop:32, textAlign:'center', fontSize:14, color:C.muted, fontWeight:500 }}>
      Qualified A/L specialists across <strong style={{ color:C.green }}>14+ subjects</strong>
    </p>
  </div>
);

// ── Main Component ────────────────────────────────────────────────
const LandingPage = () => {
  const [visible,     setVisible]     = useState(false);
  const [gradeFilter, setGradeFilter] = useState('Both');
  const [langFilter,  setLangFilter]  = useState('English');
  const [openFaq,     setOpenFaq]     = useState(null);

  useEffect(() => { setTimeout(() => setVisible(true), 120); }, []);

  const navLinks = [['Browse Classes','#subjects'],['How It Works','#how'],['Subjects','#subjects'],['For Parents','#why'],['FAQ','#faq']];

  const hoverGreen = e => { e.currentTarget.style.background = C.green; e.currentTarget.style.color = 'white'; };
  const hoverOff   = (orig) => e => { e.currentTarget.style.background = orig; e.currentTarget.style.color = C.green; };

  return (
    <div style={{ fontFamily:"'DM Sans', 'Roboto', sans-serif", background:C.bg, color:C.dark }}>

      {/* ── NAV ── */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(12px)', borderBottom:`1px solid ${C.border}`, padding:'0 48px', display:'flex', alignItems:'center', height:68, boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginRight:40 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${C.green},${C.green2})`, display:'flex', alignItems:'center', justifyContent:'center', color:C.gold, fontWeight:800, fontSize:16 }}>X</div>
          <span style={{ fontWeight:800, fontSize:20, color:C.green }}>XenEdu</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:28, flex:1 }}>
          {navLinks.map(([label,href]) => (
            <a key={label} href={href} style={{ color:'#666', fontSize:14, fontWeight:500 }}
              onMouseEnter={e=>e.target.style.color=C.green} onMouseLeave={e=>e.target.style.color='#666'}
            >{label}</a>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <a href="tel:03322422589" style={{ color:C.green, fontSize:14, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>📞 Contact Us</a>
          <Link to="/register" style={{ padding:'8px 18px', borderRadius:8, border:`1.5px solid ${C.green}`, color:C.green, fontSize:14, fontWeight:600 }}
            onMouseEnter={hoverGreen} onMouseLeave={hoverOff('transparent')}
          >Register</Link>
          <Link to="/login" style={{ padding:'8px 18px', borderRadius:8, background:C.green, color:'white', fontSize:14, fontWeight:600, boxShadow:`0 2px 10px ${C.green}4d` }}
            onMouseEnter={e=>e.target.style.background='#0a505d'} onMouseLeave={e=>e.target.style.background=C.green}
          >Login</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:'92vh', display:'flex', alignItems:'center', padding:'0 48px', gap:40, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60,  right:'45%', width:300, height:300, borderRadius:'50%', background:C.gold,  opacity:0.09, zIndex:0, pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-80,right:'55%', width:250, height:250, borderRadius:'50%', background:C.green, opacity:0.06, zIndex:0, pointerEvents:'none' }}/>

        <div style={{ flex:1, zIndex:1, opacity:visible?1:0, transform:visible?'translateX(0)':'translateX(-40px)', transition:'opacity 0.9s ease, transform 0.9s ease' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.greenPale, border:`1px solid ${C.greenBorder}`, borderRadius:20, padding:'6px 16px', marginBottom:24 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:C.green }}/>
            <span style={{ color:C.green, fontSize:13, fontWeight:600 }}>Sri Lanka's Smart Tuition System</span>
          </div>

          <h1 style={{ fontSize:'clamp(38px,5vw,58px)', fontWeight:800, lineHeight:1.12, margin:'0 0 20px', color:C.dark }}>
            Study smarter.<br/>
            <span style={{ background:`linear-gradient(135deg,${C.green},${C.green2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Score higher.
            </span>
          </h1>

          <p style={{ fontSize:17, color:'#666', lineHeight:1.7, margin:'0 0 32px', maxWidth:480 }}>
            XenEdu combines expert A/L teachers with AI-powered learning tools —
            built for <strong style={{ color:C.green }}>Sri Lankan students</strong> who aim for the top.
          </p>

          <p style={{ fontSize:12, color:C.muted, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>Browse by Grade</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
            {['Grade 12','Grade 13','Both'].map(g => (
              <button key={g} onClick={()=>setGradeFilter(g)}
                style={{ padding:'7px 16px', borderRadius:20, border:`1.5px solid ${C.green}`, background: gradeFilter===g?C.green:'transparent', color: gradeFilter===g?'white':C.green, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}
              >{g}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:32 }}>
            {['Sinhala','Tamil','English'].map(l => (
              <button key={l} onClick={()=>setLangFilter(l)}
                style={{ padding:'7px 16px', borderRadius:20, border:`1.5px solid ${C.gold}`, background: langFilter===l?C.gold:'transparent', color: langFilter===l?C.green:'#b8860b', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}
              >{l}</button>
            ))}
          </div>

          <div style={{ display:'flex', gap:12 }}>
            <Link to="/register" style={{ padding:'14px 32px', borderRadius:12, background:C.green, color:'white', fontSize:15, fontWeight:700, boxShadow:`0 4px 20px ${C.green}55`, transition:'all 0.2s' }}
              onMouseEnter={e=>{ e.target.style.background='#0a505d'; e.target.style.transform='translateY(-2px)'; }}
              onMouseLeave={e=>{ e.target.style.background=C.green;   e.target.style.transform='translateY(0)'; }}
            >Find a Class</Link>
            <a href="#how" style={{ padding:'14px 32px', borderRadius:12, border:'1.5px solid #ddd', color:'#444', fontSize:15, fontWeight:600 }}
              onMouseEnter={e=>{ e.target.style.borderColor=C.green; e.target.style.color=C.green; }}
              onMouseLeave={e=>{ e.target.style.borderColor='#ddd';  e.target.style.color='#444'; }}
            >How it works</a>
          </div>
        </div>

        <HeroRight visible={visible}/>
      </section>

      {/* ── STATS ── */}
      <section style={{ background:C.green, padding:'32px 48px', display:'flex', justifyContent:'center', gap:80 }}>
        {stats.map((s,i) => (
          <div key={i} style={{ textAlign:'center' }}>
            <p style={{ margin:0, fontSize:36, fontWeight:800, color:C.gold }}>{s.number}</p>
            <p style={{ margin:'4px 0 0', fontSize:14, color:'rgba(255,255,255,0.8)', fontWeight:500 }}>{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding:'80px 48px', background:'white' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <p style={{ color:C.green, fontWeight:700, fontSize:13, letterSpacing:2, marginBottom:12, textTransform:'uppercase' }}>How It Works</p>
          <h2 style={{ fontSize:'clamp(26px,3.5vw,38px)', fontWeight:800, margin:'0 0 16px', color:C.dark }}>Get started in 3 simple steps</h2>
          <p style={{ color:C.muted, fontSize:15, maxWidth:480, margin:'0 auto' }}>From registration to learning — our process is simple, fast and fully online.</p>
        </div>
        <div style={{ display:'flex', gap:32, maxWidth:900, margin:'0 auto' }}>
          {steps.map((step,i) => (
            <div key={i} style={{
              flex:1, textAlign:'center', padding:'32px 24px', borderRadius:20,
              background: i===1 ? C.green : '#FAFAF8',
              border:     i===1 ? 'none' : `1px solid ${C.border}`,
              boxShadow:  i===1 ? `0 10px 40px ${C.green}40` : '0 2px 10px rgba(0,0,0,0.04)',
              transform:  i===1 ? 'translateY(-12px)' : 'translateY(0)',
            }}>
              <div style={{ width:56, height:56, borderRadius:16, background: i===1?'rgba(245,197,24,0.2)':C.greenPale, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:18, fontWeight:800, color: i===1?C.gold:C.green }}>
                {step.number}
              </div>
              <h3 style={{ fontSize:18, fontWeight:700, margin:'0 0 12px', color: i===1?'white':C.dark }}>{step.title}</h3>
              <p style={{ fontSize:14, lineHeight:1.6, margin:0, color: i===1?'rgba(255,255,255,0.75)':C.muted }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SUBJECTS ── */}
      <section id="subjects" style={{ padding:'80px 48px', background:C.bg }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <p style={{ color:C.green, fontWeight:700, fontSize:13, letterSpacing:2, marginBottom:12, textTransform:'uppercase' }}>Our Subjects</p>
          <h2 style={{ fontSize:'clamp(26px,3.5vw,38px)', fontWeight:800, margin:0, color:C.dark }}>Expert teachers for every subject</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, maxWidth:1000, margin:'0 auto' }}>
          {subjects.map((s,i) => (
            <div key={i} style={{ background:'white', borderRadius:16, padding:24, border:`1px solid ${C.border}`, textAlign:'center', cursor:'pointer', transition:'all 0.3s ease' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow=`0 12px 30px ${C.green}26`; e.currentTarget.style.borderColor=C.green; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=C.border; }}
            >
              <div style={{ fontSize:32, marginBottom:12 }}>{s.icon}</div>
              <p style={{ margin:'0 0 6px', fontWeight:700, fontSize:14, color:C.dark }}>{s.name}</p>
              <p style={{ margin:0, fontSize:12, color:C.green, fontWeight:600 }}>{s.teachers} teachers</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY XENEDU ── */}
      <section id="why" style={{ padding:'80px 48px', background:'white' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', display:'flex', gap:60, alignItems:'center' }}>
          <div style={{ flex:1 }}>
            <p style={{ color:C.green, fontWeight:700, fontSize:13, letterSpacing:2, marginBottom:12, textTransform:'uppercase' }}>Why XenEdu</p>
            <h2 style={{ fontSize:'clamp(26px,3.5vw,38px)', fontWeight:800, margin:'0 0 32px', color:C.dark }}>Everything your child needs to succeed</h2>
            {whyItems.map((item,i) => (
              <div key={i} style={{ display:'flex', gap:16, alignItems:'flex-start', marginBottom:24 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:C.greenPale, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{item.icon}</div>
                <div>
                  <p style={{ margin:'0 0 4px', fontWeight:700, fontSize:15, color:C.dark }}>{item.title}</p>
                  <p style={{ margin:0, fontSize:14, color:C.muted, lineHeight:1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ background:`linear-gradient(135deg,${C.green},${C.green2})`, borderRadius:24, padding:40, color:'white', textAlign:'center' }}>
              <h3 style={{ fontSize:24, fontWeight:800, margin:'0 0 12px' }}>Ready to get started?</h3>
              <p style={{ fontSize:14, opacity:0.8, margin:'0 0 28px', lineHeight:1.6 }}>Join hundreds of A/L students already excelling with XenEdu's smart tuition system.</p>
              <Link to="/register" style={{ display:'inline-block', background:C.gold, color:C.green, padding:'14px 36px', borderRadius:12, fontWeight:800, fontSize:15, boxShadow:`0 4px 15px ${C.gold}66`, transition:'transform 0.2s' }}
                onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
                onMouseLeave={e=>e.target.style.transform='scale(1)'}
              >Register Now — It's Free</Link>
              <p style={{ margin:'16px 0 0', fontSize:12, opacity:0.7 }}>No credit card required</p>
              <div style={{ marginTop:28, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.2)', display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap', fontSize:12, opacity:0.85 }}>
                {[['📍','XenEdu Mirigama'],['📧','xenedu@gmail.com'],['📞','033-2242-2589']].map(([icon,text]) => (
                  <span key={text}>{icon} {text}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding:'80px 48px', background:C.bg }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <p style={{ color:C.green, fontWeight:700, fontSize:13, letterSpacing:2, marginBottom:12, textTransform:'uppercase' }}>Student Stories</p>
          <h2 style={{ fontSize:'clamp(26px,3.5vw,38px)', fontWeight:800, margin:0, color:C.dark }}>Results that speak for themselves</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
          {testimonials.map((t,i) => (
            <div key={i} style={{ background:'white', borderRadius:20, padding:'32px 28px', border:`1px solid ${C.border}` }}>
              <div style={{ color:C.gold, fontSize:16, letterSpacing:2, marginBottom:16 }}>★★★★★</div>
              <p style={{ fontSize:15, color:'#444', lineHeight:1.7, marginBottom:24, fontStyle:'italic' }}>"{t.text}"</p>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:C.green, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'white', fontWeight:700 }}>{t.initial}</div>
                <div>
                  <p style={{ margin:'0 0 2px', fontSize:14, fontWeight:700, color:C.dark }}>{t.name}</p>
                  <p style={{ margin:0, fontSize:13, color:C.muted }}>{t.grade}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding:'80px 48px', background:'white' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <p style={{ color:C.green, fontWeight:700, fontSize:13, letterSpacing:2, marginBottom:12, textTransform:'uppercase' }}>FAQ</p>
          <h2 style={{ fontSize:'clamp(26px,3.5vw,38px)', fontWeight:800, margin:'0 0 12px', color:C.dark }}>Frequently asked questions</h2>
          <p style={{ color:C.muted, fontSize:15 }}>Can't find what you're looking for? Ask Zenya — our AI assistant! 🤖</p>
        </div>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          {faqs.map((faq,i) => (
            <div key={i} style={{ background: openFaq===i?'white':C.bg, borderRadius:14, marginBottom:12, border: openFaq===i?`1.5px solid ${C.green}`:`1px solid ${C.border}`, overflow:'hidden' }}>
              <button onClick={()=>setOpenFaq(openFaq===i?null:i)}
                style={{ width:'100%', padding:'18px 24px', background:'none', border:'none', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', textAlign:'left', fontFamily:'inherit' }}>
                <span style={{ fontWeight:600, fontSize:15, color:C.dark }}>{faq.q}</span>
                <span style={{ color:C.green, fontSize:22, fontWeight:300, flexShrink:0, marginLeft:12, transform: openFaq===i?'rotate(45deg)':'rotate(0)', transition:'transform 0.3s ease', display:'inline-block' }}>+</span>
              </button>
              {openFaq===i && <div style={{ padding:'0 24px 18px', fontSize:14, color:'#666', lineHeight:1.6 }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#1a1a1a', color:'white', padding:'48px 48px 24px' }}>
        <div style={{ display:'flex', gap:60, paddingBottom:40, borderBottom:'1px solid rgba(255,255,255,0.1)', marginBottom:24 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${C.green},${C.green2})`, display:'flex', alignItems:'center', justifyContent:'center', color:C.gold, fontWeight:800, fontSize:14 }}>X</div>
              <span style={{ fontWeight:800, fontSize:18, color:C.gold }}>XenEdu</span>
            </div>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, lineHeight:1.6, maxWidth:280 }}>Sri Lanka's smart A/L tuition management system with AI-powered learning.</p>
          </div>
          {[
            { title:'Quick Links', links:['Browse Classes','Register','Login','How It Works'] },
            { title:'Subjects',    links:['Physics','Mathematics','Chemistry','Biology','Economics'] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontWeight:700, fontSize:14, marginBottom:16, color:C.gold }}>{col.title}</p>
              {col.links.map(l => <p key={l} style={{ margin:'0 0 8px', fontSize:14, color:'rgba(255,255,255,0.6)' }}>{l}</p>)}
            </div>
          ))}
          <div>
            <p style={{ fontWeight:700, fontSize:14, marginBottom:16, color:C.gold }}>Contact Us</p>
            {[['📍','XenEdu Mirigama'],['📧','xenedu@gmail.com'],['📞','033-2242-2589']].map(([icon,text]) => (
              <p key={text} style={{ margin:'0 0 10px', fontSize:14, color:'rgba(255,255,255,0.6)', display:'flex', gap:8 }}><span>{icon}</span>{text}</p>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.4)' }}>© 2026 XenEdu Mirigama. All rights reserved.</p>
          <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.4)' }}>Powered by <span style={{ color:C.green2 }}>Vyosity</span></p>
        </div>
      </footer>

      {/* ── ZENYA CHAT — uses common component, same as student portal ── */}
      <ZenyaChat/>
    </div>
  );
};

export default LandingPage;