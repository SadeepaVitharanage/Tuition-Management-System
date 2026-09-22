import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { School, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { GRADES, MEDIUMS, STREAMS } from '../../utils/constants';

// ── Teal palette (matches LandingPage & LoginPage) ────────────────
const C = {
  green:  '#0d6b7a',
  green2: '#00b8c8',
  gold:   '#F5C518',
  dark:   '#1a1a1a',
  muted:  '#888',
  border: '#E8E8E8',
  bg:     '#FAFAF8',
};

// ── Shared input style ────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '11px 16px',
  border: `1.5px solid ${C.border}`, borderRadius: 12,
  fontSize: 14, outline: 'none', background: 'white',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
  color: C.dark, fontFamily: 'inherit',
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: C.muted, textTransform: 'uppercase',
  letterSpacing: 0.8, marginBottom: 6,
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    studentName: '', studentEmail: '', school: '',
    grade: '', medium: '', stream: '',
    parentName: '', parentEmail: '', parentContact: '', parentAddress: '',
  });

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/register/apply', form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const validateStep1 = () => {
    if (!form.studentName || !form.studentEmail || !form.school || !form.grade || !form.medium || !form.stream) {
      toast.error('Please fill all student details'); return false;
    }
    return true;
  };
  const validateStep2 = () => {
    if (!form.parentName || !form.parentEmail || !form.parentContact) {
      toast.error('Please fill all parent details'); return false;
    }
    return true;
  };

  // ── Success screen ────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'DM Sans', Roboto, sans-serif" }}>
        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.1)', padding: 48, maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: `${C.green}18`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={32} color={C.green}/>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.dark, margin: '0 0 12px' }}>Application Submitted!</h2>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
            Your registration request has been submitted. Our admin will review your application and contact you shortly.
          </p>
          <div style={{ background: C.bg, borderRadius: 14, padding: 18, textAlign: 'left', marginBottom: 16 }}>
            {[['Student', form.studentName], ['Email', form.studentEmail], ['Grade', form.grade]].map(([k,v]) => (
              <p key={k} style={{ margin: '0 0 8px', fontSize: 13, color: '#555' }}>
                <span style={{ fontWeight: 700 }}>{k}:</span> {v}
              </p>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#bbb', marginBottom: 24 }}>Once approved, you will receive login credentials via email.</p>
          <button onClick={() => navigate('/login')}
            style={{ width: '100%', padding: '13px', background: C.green, color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 15px ${C.green}4d`, transition: 'background 0.2s' }}
            onMouseEnter={e => e.target.style.background = '#0a505d'}
            onMouseLeave={e => e.target.style.background = C.green}
          >Back to Login</button>
        </div>
      </div>
    );
  }

  const stepTitles = ['Student Details', 'Parent Details', 'Review & Submit'];

  // ── Main form ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', fontFamily: "'DM Sans', Roboto, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <School size={26} color={C.green}/>
            <span style={{ fontSize: 28, fontWeight: 800, color: C.green }}>XenEdu</span>
          </div>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>A/L Tuition Management System</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

          {/* Progress bar */}
          <div style={{ display: 'flex' }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ flex: 1, height: 5, background: s <= step ? C.green : '#F0F0F0', transition: 'background 0.4s ease' }}/>
            ))}
          </div>

          <div style={{ padding: 32 }}>

            {/* Step header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 4px' }}>
                  Step {step} of 3
                </p>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.dark, margin: 0 }}>{stepTitles[step-1]}</h2>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3].map(s => (
                  <div key={s} style={{ width: 10, height: 10, borderRadius: '50%', transition: 'background 0.3s',
                    background: s === step ? C.green : s < step ? `${C.green}66` : '#E0E0E0' }}/>
                ))}
              </div>
            </div>

            {/* ── Step 1 — Student ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label:'Full Name',      field:'studentName',  type:'text',  placeholder:'Your full name' },
                  { label:'Email Address',  field:'studentEmail', type:'email', placeholder:'your@email.com' },
                  { label:'School',         field:'school',       type:'text',  placeholder:'Your school name' },
                ].map(({ label, field, type, placeholder }) => (
                  <div key={field}>
                    <label style={labelStyle}>{label}</label>
                    <input type={type} value={form[field]} onChange={e => update(field, e.target.value)}
                      placeholder={placeholder} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = C.green}
                      onBlur={e  => e.target.style.borderColor = C.border}
                    />
                  </div>
                ))}
                {/* Grade / Medium / Stream row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[
                    { label:'Grade',  field:'grade',  options: GRADES  },
                    { label:'Medium', field:'medium', options: MEDIUMS },
                    { label:'Stream', field:'stream', options: STREAMS },
                  ].map(({ label, field, options }) => (
                    <div key={field}>
                      <label style={labelStyle}>{label}</label>
                      <select value={form[field]} onChange={e => update(field, e.target.value)}
                        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                        onFocus={e => e.target.style.borderColor = C.green}
                        onBlur={e  => e.target.style.borderColor = C.border}
                      >
                        <option value="">{label}</option>
                        {options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2 — Parent ── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label:'Parent / Guardian Name', field:'parentName',    type:'text',  placeholder:'Parent full name' },
                  { label:'Parent Email',            field:'parentEmail',   type:'email', placeholder:'parent@email.com' },
                  { label:'Contact Number',          field:'parentContact', type:'text',  placeholder:'07XXXXXXXX' },
                ].map(({ label, field, type, placeholder }) => (
                  <div key={field}>
                    <label style={labelStyle}>{label}</label>
                    <input type={type} value={form[field]} onChange={e => update(field, e.target.value)}
                      placeholder={placeholder} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = C.green}
                      onBlur={e  => e.target.style.borderColor = C.border}
                    />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>Address</label>
                  <textarea value={form.parentAddress} onChange={e => update('parentAddress', e.target.value)}
                    placeholder="Home address" rows={3}
                    style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e  => e.target.style.borderColor = C.border}
                  />
                </div>
              </div>
            )}

            {/* ── Step 3 — Review ── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  {
                    title: 'Student Details',
                    rows: [
                      ['Name', form.studentName],   ['Email', form.studentEmail],
                      ['School', form.school],       ['Grade', form.grade],
                      ['Medium', form.medium],       ['Stream', form.stream],
                    ],
                  },
                  {
                    title: 'Parent Details',
                    rows: [
                      ['Name', form.parentName],    ['Email', form.parentEmail],
                      ['Contact', form.parentContact], ['Address', form.parentAddress || 'N/A'],
                    ],
                  },
                ].map(block => (
                  <div key={block.title} style={{ background: C.bg, borderRadius: 14, padding: '16px 18px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>{block.title}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                      {block.rows.map(([k,v]) => (
                        <div key={k}>
                          <p style={{ margin: '0 0 2px', fontSize: 12, color: '#aaa' }}>{k}</p>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.dark }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: 12, color: '#bbb', textAlign: 'center', margin: 0 }}>
                  By submitting, you confirm this information is accurate. Admin will review your application.
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              {step > 1 && (
                <button onClick={() => setStep(step - 1)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 20px', border: `1.5px solid ${C.border}`, borderRadius: 12, color: '#555', fontWeight: 600, fontSize: 14, background: 'white', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.green}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  <ChevronLeft size={16}/> Back
                </button>
              )}
              {step < 3 && (
                <button onClick={() => {
                    if (step === 1 && !validateStep1()) return;
                    if (step === 2 && !validateStep2()) return;
                    setStep(step + 1);
                  }}
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 20px', background: C.green, color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 15px ${C.green}4d`, transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0a505d'}
                  onMouseLeave={e => e.currentTarget.style.background = C.green}
                >
                  Next <ChevronRight size={16}/>
                </button>
              )}
              {step === 3 && (
                <button onClick={handleSubmit} disabled={loading}
                  style={{ flex: 1, padding: '11px 20px', background: loading ? '#0a505d' : C.green, color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: `0 4px 15px ${C.green}4d`, opacity: loading ? 0.75 : 1, transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0a505d'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.green; }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }}/>
                      Submitting...
                    </span>
                  ) : 'Submit Application'}
                </button>
              )}
            </div>

          </div>
        </div>

        <p style={{ textAlign: 'center', color: C.muted, marginTop: 20, fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: C.green, fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default RegisterPage;
