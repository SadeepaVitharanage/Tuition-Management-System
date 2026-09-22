import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// ── Teal palette (matches LandingPage, LoginPage, RegisterPage) ───
const C = {
  green:  '#0d6b7a',
  green2: '#00b8c8',
  gold:   '#F5C518',
  dark:   '#1a1a1a',
  muted:  '#888',
  border: '#E8E8E8',
  bg:     '#FAFAF8',
};

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm]               = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [visible, setVisible]         = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const getStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 8)          s++;
    if (/[A-Z]/.test(pwd))        s++;
    if (/[0-9]/.test(pwd))        s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '13px 48px 13px 16px',
    border: `1.5px solid ${C.border}`, borderRadius: 12,
    fontSize: 14, outline: 'none', background: 'white',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
    color: C.dark, fontFamily: 'inherit',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', Roboto, sans-serif",
      background: C.bg, alignItems: 'center', justifyContent: 'center', padding: 40,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg,${C.green},${C.green2})`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: C.gold, fontWeight: 800, fontSize: 24, marginBottom: 12,
          }}>X</div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 20, color: C.green }}>XenEdu</p>
        </div>

        {!success ? (
          <div style={{ background: 'white', borderRadius: 20, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: `1px solid ${C.border}` }}>

            {/* Icon */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${C.green}18`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🔑</div>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.dark, margin: '0 0 8px', textAlign: 'center' }}>Set New Password</h1>
            <p style={{ color: C.muted, fontSize: 14, margin: '0 0 28px', textAlign: 'center' }}>Choose a strong password for your XenEdu account.</p>

            <form onSubmit={handleSubmit}>

              {/* New Password */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8 }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters" required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e  => e.target.style.borderColor = C.border}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Strength meter */}
                {form.password.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, transition: 'background 0.3s', background: i <= strength ? strengthColors[strength] : C.border }}/>
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: strengthColors[strength] }}>{strengthLabels[strength]}</p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8 }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat your password" required
                    style={{
                      ...inputStyle,
                      borderColor: form.confirmPassword
                        ? form.password !== form.confirmPassword ? '#EF4444'
                        : '#10B981'
                        : C.border,
                    }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#EF4444' }}>Passwords do not match</p>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#10B981' }}>✓ Passwords match</p>
                )}
              </div>

              {/* Submit */}
              <button type="submit"
                disabled={loading || form.password !== form.confirmPassword}
                style={{
                  width: '100%', padding: 14,
                  background: (loading || form.password !== form.confirmPassword) ? '#ccc' : C.green,
                  color: 'white', border: 'none', borderRadius: 12,
                  fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
                  cursor: (loading || form.password !== form.confirmPassword) ? 'not-allowed' : 'pointer',
                  boxShadow: `0 4px 15px ${C.green}4d`,
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}
                onMouseEnter={e => { if (!loading && form.password === form.confirmPassword) e.currentTarget.style.background = '#0a505d'; }}
                onMouseLeave={e => { if (!loading && form.password === form.confirmPassword) e.currentTarget.style.background = C.green; }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }}/>
                    Resetting...
                  </>
                ) : 'Reset Password'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link to="/login" style={{ color: C.muted, fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = C.green}
                onMouseLeave={e => e.target.style.color = C.muted}
              >← Back to Login</Link>
            </div>
          </div>

        ) : (
          /* Success */
          <div style={{ background: 'white', borderRadius: 20, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: `1px solid ${C.border}`, textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${C.green}18`, border: `3px solid ${C.green}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.dark, margin: '0 0 12px' }}>Password Reset!</h2>
            <p style={{ color: '#666', fontSize: 14, margin: '0 0 8px', lineHeight: 1.6 }}>Your password has been successfully reset.</p>
            <p style={{ color: '#aaa', fontSize: 13, margin: '0 0 24px' }}>Redirecting to login in 3 seconds...</p>
            <Link to="/login" style={{ display: 'inline-block', background: `linear-gradient(135deg,${C.green},${C.green2})`, color: 'white', padding: '12px 32px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Go to Login
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage;
