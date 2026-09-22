import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ChangePassword = ({ onClose }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({
    current: false, new: false, confirm: false,
  });

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
  const strength = getStrength(form.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 48px 11px 14px',
    border: '1.5px solid #E8E8E8', borderRadius: '10px',
    fontSize: '14px', outline: 'none', background: 'white',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
    color: '#1a1a1a', fontFamily: 'Roboto, sans-serif',
  };

  const fields = [
    { key: 'currentPassword', label: 'Current Password', showKey: 'current' },
    { key: 'newPassword', label: 'New Password', showKey: 'new' },
    { key: 'confirmPassword', label: 'Confirm New Password', showKey: 'confirm' },
  ];

  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '24px',
      border: '1px solid #F0F0F0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>
          🔐 Change Password
        </h3>
        {onClose && (
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#888', fontSize: '18px',
          }}>✕</button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {fields.map(field => (
          <div key={field.key} style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: '600', color: '#444', marginBottom: '6px',
            }}>
              {field.label}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={show[field.showKey] ? 'text' : 'password'}
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                placeholder="••••••••"
                required
                style={{
                  ...inputStyle,
                  borderColor: field.key === 'confirmPassword' && form.confirmPassword
                    ? form.newPassword === form.confirmPassword ? '#10B981' : '#EF4444'
                    : '#E8E8E8',
                }}
                onFocus={e => e.target.style.borderColor = '#1B6B5A'}
                onBlur={e => {
                  if (field.key === 'confirmPassword' && form.confirmPassword) {
                    e.target.style.borderColor = form.newPassword === form.confirmPassword
                      ? '#10B981' : '#EF4444';
                  } else {
                    e.target.style.borderColor = '#E8E8E8';
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShow({ ...show, [field.showKey]: !show[field.showKey] })}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px',
                }}
              >
                {show[field.showKey] ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Strength indicator for new password */}
            {field.key === 'newPassword' && form.newPassword.length > 0 && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '3px', borderRadius: '2px',
                      background: i <= strength ? strengthColors[strength] : '#E8E8E8',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </p>
              </div>
            )}

            {field.key === 'confirmPassword' && form.confirmPassword && (
              <p style={{
                margin: '4px 0 0', fontSize: '12px',
                color: form.newPassword === form.confirmPassword ? '#10B981' : '#EF4444',
              }}>
                {form.newPassword === form.confirmPassword ? '✓ Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading || !form.currentPassword || !form.newPassword || form.newPassword !== form.confirmPassword}
          style={{
            width: '100%', padding: '13px',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #1B6B5A, #00B894)',
            color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '14px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(27,107,90,0.25)',
            transition: 'all 0.2s', marginTop: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                animation: 'spin 0.7s linear infinite',
                display: 'inline-block',
              }} />
              Changing...
            </>
          ) : 'Change Password'}
        </button>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ChangePassword;