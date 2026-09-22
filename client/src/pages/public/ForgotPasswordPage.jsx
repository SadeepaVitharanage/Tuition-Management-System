import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// ── Teal palette (matches LandingPage, LoginPage, RegisterPage, ResetPasswordPage) ─
const C = {
  green:  '#0d6b7a',
  green2: '#00b8c8',
  gold:   '#F5C518',
  dark:   '#1a1a1a',
  muted:  '#888',
  border: '#E8E8E8',
  bg:     '#FAFAF8',
};

const ForgotPasswordPage = () => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: 'white', borderRadius: 20, padding: 36,
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: `1px solid ${C.border}`,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', Roboto, sans-serif", background: C.bg }}>
      <div style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: `linear-gradient(135deg,${C.green},${C.green2})`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: C.gold, fontWeight: 800, fontSize: 24, marginBottom: 12,
            }}>X</div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 20, color: C.green }}>XenEdu</p>
          </div>

          {!sent ? (
            <div style={cardStyle}>
              {/* Icon */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${C.green}18`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🔐</div>
              </div>

              <h1 style={{ fontSize: 24, fontWeight: 800, color: C.dark, margin: '0 0 8px', textAlign: 'center' }}>Forgot Password?</h1>
              <p style={{ color: C.muted, fontSize: 14, margin: '0 0 28px', textAlign: 'center', lineHeight: 1.6 }}>
                No worries! Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8 }}>Email Address</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" required
                    style={{ width: '100%', padding: '13px 16px', border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 14, outline: 'none', background: 'white', transition: 'border-color 0.2s', boxSizing: 'border-box', color: C.dark, fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e  => e.target.style.borderColor = C.border}
                  />
                </div>

                <button type="submit" disabled={loading}
                  style={{
                    width: '100%', padding: 14,
                    background: loading ? '#ccc' : C.green,
                    color: 'white', border: 'none', borderRadius: 12,
                    fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : `0 4px 15px ${C.green}4d`,
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0a505d'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.green; }}
                >
                  {loading ? (
                    <>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }}/>
                      Sending...
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Link to="/login" style={{ color: C.green, fontWeight: 600, fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onMouseEnter={e => e.target.style.opacity = '0.75'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >← Back to Login</Link>
              </div>
            </div>

          ) : (
            /* Success */
            <div style={{ ...cardStyle, textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${C.green}18`, border: `3px solid ${C.green}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 20 }}>📧</div>

              <h2 style={{ fontSize: 22, fontWeight: 800, color: C.dark, margin: '0 0 12px' }}>Check your email!</h2>
              <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6, margin: '0 0 8px' }}>We sent a password reset link to:</p>
              <p style={{ color: C.green, fontWeight: 700, fontSize: 15, margin: '0 0 24px' }}>{email}</p>
              <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.6, margin: '0 0 28px' }}>
                The link expires in <strong>1 hour</strong>. Check your spam folder if you don't see it.
              </p>

              <button onClick={() => { setSent(false); setEmail(''); }}
                style={{ background: 'none', border: `1.5px solid ${C.green}`, color: C.green, borderRadius: 12, padding: '10px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 16, transition: 'all 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.background = C.green; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none';   e.currentTarget.style.color = C.green; }}
              >Try different email</button>

              <div>
                <Link to="/login" style={{ color: C.muted, fontSize: 14, textDecoration: 'none', display: 'block' }}
                  onMouseEnter={e => e.target.style.color = C.green}
                  onMouseLeave={e => e.target.style.color = C.muted}
                >← Back to Login</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;
