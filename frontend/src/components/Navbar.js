import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { fetchNotificationsRequest } from '../store/slices/notificationSlice';

const NAV = [
  { path: '/', label: 'Home', icon: '' },
  { path: '/items', label: 'Browse', icon: '' },
  { path: '/report', label: 'Report', icon: '' },
  { path: '/my-items', label: 'My Items', icon: '' },
  { path: '/claims', label: 'Claims', icon: '' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(s => s.auth);
  const { list } = useSelector(s => s.notifications);
  const unread = list.filter(n => !n.read).length;

  useEffect(() => {
    if (user?.id) dispatch(fetchNotificationsRequest(user.id));
    const interval = setInterval(() => {
      if (user?.id) dispatch(fetchNotificationsRequest(user.id));
    }, 30000);
    return () => clearInterval(interval);
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <span style={styles.logo}></span>
        <span style={styles.brandText}>Lost<span style={{ color: 'var(--green)' }}>&</span>Found</span>
      </div>
      <div style={styles.links}>
        {NAV.map(n => (
          <Link key={n.path} to={n.path} style={{
            ...styles.link,
            ...(location.pathname === n.path ? styles.activeLink : {})
          }}>
            <span style={styles.linkIcon}>{n.icon}</span>
            <span style={styles.linkLabel}>{n.label}</span>
            {location.pathname === n.path && <span style={styles.activeDot} />}
          </Link>
        ))}
        <Link to="/notifications" style={{
          ...styles.link,
          ...(location.pathname === '/notifications' ? styles.activeLink : {}),
          position: 'relative'
        }}>
          <span style={styles.linkIcon}></span>
          <span style={styles.linkLabel}>Alerts</span>
          {unread > 0 && (
            <span style={styles.badge}>{unread > 9 ? '9+' : unread}</span>
          )}
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin" style={{
            ...styles.link,
            ...(location.pathname === '/admin' ? styles.activeLink : {})
          }}>
            <span style={styles.linkIcon}></span>
            <span style={styles.linkLabel}>Admin</span>
          </Link>
        )}
      </div>
      <div style={styles.userSection}>
        <div style={{ ...styles.avatar, background: user?.avatar_color || '#4CAF50' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.name}</span>
          <span style={styles.userDept}>{user?.department || 'Student'}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">⇠</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    height: 70,
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--gray-200)',
    display: 'flex', alignItems: 'center',
    padding: '0 24px', gap: 16,
    boxShadow: '0 1px 20px rgba(0,0,0,0.06)',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 8, marginRight: 8, flexShrink: 0 },
  logo: { fontSize: 24 },
  brandText: { fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, color: 'var(--gray-800)' },
  links: { display: 'flex', alignItems: 'center', gap: 2, flex: 1 },
  link: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 10,
    color: 'var(--gray-500)', fontSize: 14, fontWeight: 500,
    transition: 'all 0.15s', textDecoration: 'none', position: 'relative',
  },
  activeLink: { background: 'var(--mint)', color: 'var(--green-dark)', fontWeight: 600 },
  activeDot: {
    position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
    width: 4, height: 4, borderRadius: '50%', background: 'var(--green)',
  },
  linkIcon: { fontSize: 16 },
  linkLabel: {},
  badge: {
    position: 'absolute', top: 2, right: 2,
    background: 'var(--coral)', color: 'white',
    borderRadius: '99px', fontSize: 10, fontWeight: 700,
    padding: '1px 5px', minWidth: 16, textAlign: 'center',
  },
  userSection: {
    display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
    paddingLeft: 16, borderLeft: '1px solid var(--gray-200)',
  },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0,
  },
  userInfo: { display: 'flex', flexDirection: 'column', lineHeight: 1.2 },
  userName: { fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' },
  userDept: { fontSize: 11, color: 'var(--gray-400)' },
  logoutBtn: {
    background: 'none', border: '1px solid var(--gray-200)',
    borderRadius: 8, padding: '6px 10px',
    fontSize: 16, color: 'var(--gray-400)',
    transition: 'all 0.15s',
  },
};
