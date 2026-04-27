import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest, registerRequest, clearError, resetRegisterSuccess } from '../store/slices/authSlice';

export default function AuthPage() {
  const dispatch = useDispatch();
  const { loading, error, registerSuccessFlag } = useSelector(s => s.auth);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', phone: '' });

  React.useEffect(() => {
    if (registerSuccessFlag) {
      setMode('login');
      setForm(f => ({ ...f, password: '' })); // clear password for security
      dispatch(resetRegisterSuccess());
      alert('Registration successful! Please sign in with your credentials.');
    }
  }, [registerSuccessFlag, dispatch]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); dispatch(clearError()); };

  const submit = (e) => {
    e.preventDefault();
    if (mode === 'login') dispatch(loginRequest({ email: form.email, password: form.password }));
    else dispatch(registerRequest(form));
  };

  const DEPTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'MBA', 'Law', 'Architecture', 'Other'];

  return (
    <div style={S.page}>
      <div style={S.left}>
        <div style={S.heroContent}>
          <div style={S.heroIcon}></div>
          <h1 style={S.heroTitle}>Campus Lost <em style={{ color: 'var(--green-light)' }}>&</em> Found</h1>
          <p style={S.heroSub}>Your campus community portal to report, find, and claim lost items.</p>
          <div style={S.features}>
            {[' Report lost or found items', ' Smart search & filters', ' Claim management', ' Real-time notifications', ' Live statistics'].map(f => (
              <div key={f} style={S.feature}>{f}</div>
            ))}
          </div>
        </div>
        <div style={S.blob1} /><div style={S.blob2} />
      </div>

      <div style={S.right}>
        <div style={S.card}>
          <div style={S.tabs}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ ...S.tab, ...(mode === m ? S.tabActive : {}) }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <h2 style={S.formTitle}>
            {mode === 'login' ? 'Welcome back ' : 'Join the community '}
          </h2>
          <p style={S.formSub}>
            {mode === 'login' ? 'Sign in to your campus account' : 'Create your free account today'}
          </p>

          {error && <div style={S.errorBox}> {error}</div>}

          <form onSubmit={submit} style={S.form}>
            {mode === 'register' && (
              <>
                <div style={S.field}>
                  <label style={S.label}>Full Name</label>
                  <input style={S.input} value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Rahul Sharma" required />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Department</label>
                  <select style={S.input} value={form.department} onChange={e => set('department', e.target.value)}>
                    <option value="">Select department</option>
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Phone Number</label>
                  <input style={S.input} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="e.g. 9876543210" required />
                </div>
              </>
            )}
            <div style={S.field}>
              <label style={S.label}>Email</label>
              <input style={S.input} type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@nirma.ac.in" required />
            </div>
            <div style={S.field}>
              <label style={S.label}>Password</label>
              <input style={S.input} type="password" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="••••••••" required minLength={6} />
            </div>
            <button type="submit" style={S.submitBtn} disabled={loading}>
              {loading ? <span style={S.spinner}></span> : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
            </button>
          </form>

          <p style={S.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={S.switchBtn}>
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', minHeight: '100vh', background: 'var(--white)' },
  left: {
    flex: 1, background: 'linear-gradient(135deg, #1e7a55 0%, #2d9b6f 50%, #4ac68a 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 60, position: 'relative', overflow: 'hidden',
  },
  heroContent: { position: 'relative', zIndex: 2, color: 'white', maxWidth: 440 },
  heroIcon: { fontSize: 56, marginBottom: 16 },
  heroTitle: { fontFamily: "'Fraunces', serif", fontSize: 42, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 },
  heroSub: { fontSize: 17, opacity: 0.9, marginBottom: 36, lineHeight: 1.6 },
  features: { display: 'flex', flexDirection: 'column', gap: 10 },
  feature: { background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 16px', fontSize: 14, backdropFilter: 'blur(4px)' },
  blob1: {
    position: 'absolute', width: 300, height: 300, borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)', top: -80, right: -80,
  },
  blob2: {
    position: 'absolute', width: 200, height: 200, borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)', bottom: -40, left: -40,
  },
  right: {
    width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 40, background: 'var(--gray-50)',
  },
  card: { width: '100%', maxWidth: 400 },
  tabs: { display: 'flex', gap: 4, background: 'var(--gray-100)', borderRadius: 12, padding: 4, marginBottom: 28 },
  tab: {
    flex: 1, padding: '10px 0', borderRadius: 9, border: 'none',
    background: 'none', fontSize: 14, fontWeight: 500, color: 'var(--gray-500)',
    transition: 'all 0.2s',
  },
  tabActive: { background: 'white', color: 'var(--gray-800)', fontWeight: 600, boxShadow: 'var(--shadow-sm)' },
  formTitle: { fontFamily: "'Fraunces', serif", fontSize: 28, color: 'var(--gray-800)', marginBottom: 6 },
  formSub: { color: 'var(--gray-400)', fontSize: 14, marginBottom: 24 },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
    padding: '10px 14px', color: '#991b1b', fontSize: 13, marginBottom: 16,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--gray-600)' },
  input: {
    padding: '11px 14px', border: '1.5px solid var(--gray-200)',
    borderRadius: 10, fontSize: 14, background: 'white',
    transition: 'border-color 0.15s', outline: 'none',
  },
  submitBtn: {
    marginTop: 4, padding: '13px', background: 'var(--green)',
    color: 'white', border: 'none', borderRadius: 12,
    fontSize: 15, fontWeight: 600, transition: 'all 0.2s',
  },
  spinner: { display: 'inline-block', animation: 'spin 1s linear infinite' },
  switchText: { textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--gray-500)' },
  switchBtn: { background: 'none', border: 'none', color: 'var(--green)', fontWeight: 600, fontSize: 13 },
};
