import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    const currentToken = localStorage.getItem('lf_token');
    const headers = { Authorization: `Bearer ${currentToken}` };
    const fetchAll = async () => {
      try {
        const [stRes, usRes, itRes, clRes] = await Promise.all([
          fetch('http://localhost:4000/api/items/stats', { headers }).then(r => r.json()),
          fetch('http://localhost:4000/api/auth/users', { headers }).then(r => r.json()),
          fetch('http://localhost:4000/api/items?limit=1000', { headers }).then(r => r.json()),
          fetch('http://localhost:4000/api/claims', { headers }).then(r => r.json())
        ]);
        setStats(stRes.error ? { total: 0, lost: 0, found: 0, resolved: 0 } : stRes);
        setUsers(usRes.error ? [] : usRes);
        setItems(itRes.items || []);
        setClaims(clRes.error ? [] : clRes);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      }
    };
    fetchAll();
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Admin Dashboard</h1>
        <p style={S.subtitle}>Manage campus lost & found activities</p>
      </div>

      <div style={S.tabs}>
        {['overview', 'users', 'items', 'claims'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{...S.tab, ...(activeTab === t ? S.activeTab : {})}}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={S.content}>
        {activeTab === 'overview' && stats && (
          <div style={S.grid}>
            <div style={S.statCard}><h3>Total Items</h3><div style={S.statNum}>{stats.total}</div></div>
            <div style={S.statCard}><h3>Active Lost</h3><div style={S.statNum}>{stats.lost}</div></div>
            <div style={S.statCard}><h3>Active Found</h3><div style={S.statNum}>{stats.found}</div></div>
            <div style={S.statCard}><h3>Resolved</h3><div style={S.statNum}>{stats.resolved}</div></div>
            <div style={S.statCard}><h3>Total Users</h3><div style={S.statNum}>{users.length}</div></div>
            <div style={S.statCard}><h3>Total Claims</h3><div style={S.statNum}>{claims.length}</div></div>
          </div>
        )}

        {activeTab === 'users' && (
          <table style={S.table}>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Dept</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name} {u.role === 'admin' ? '' : ''}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.department || '-'}</td>
                  <td>{formatDistanceToNow(new Date(u.created_at))} ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'items' && (
          <table style={S.table}>
            <thead><tr><th>Type</th><th>Title</th><th>Category</th><th>Status</th><th>Reported By</th></tr></thead>
            <tbody>
              {items.map(i => (
                <tr key={i._id}>
                  <td><span style={S.pill(i.type === 'lost' ? '#ef4444' : '#16a34a')}>{i.type.toUpperCase()}</span></td>
                  <td>{i.title}</td>
                  <td>{i.category}</td>
                  <td><span style={S.pill(i.status === 'resolved' ? '#7c3aed' : '#f59e0b')}>{i.status}</span></td>
                  <td>{i.reportedBy?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'claims' && (
          <table style={S.table}>
            <thead><tr><th>Item ID</th><th>Claimant</th><th>Description</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {claims.map(c => (
                <tr key={c.id}>
                  <td>{c.item_id.slice(-6)}...</td>
                  <td>{c.claimant_name}</td>
                  <td style={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{c.description}</td>
                  <td><span style={S.pill(c.status === 'approved' ? '#16a34a' : c.status === 'rejected' ? '#ef4444' : '#f59e0b')}>{c.status}</span></td>
                  <td>{formatDistanceToNow(new Date(c.created_at))} ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const S = {
  page: { padding: '40px', maxWidth: 1200, margin: '0 auto' },
  header: { marginBottom: 30 },
  title: { fontFamily: "'Fraunces', serif", fontSize: 32, color: 'var(--gray-800)', marginBottom: 8 },
  subtitle: { color: 'var(--gray-500)' },
  tabs: { display: 'flex', gap: 10, marginBottom: 30, borderBottom: '2px solid var(--gray-100)' },
  tab: { padding: '10px 20px', background: 'none', border: 'none', fontSize: 14, fontWeight: 600, color: 'var(--gray-400)', cursor: 'pointer' },
  activeTab: { color: 'var(--green)', borderBottom: '3px solid var(--green)', marginBottom: -2 },
  content: { background: 'white', padding: 30, borderRadius: 16, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 },
  statCard: { padding: 20, background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)' },
  statNum: { fontSize: 32, fontWeight: 700, color: 'var(--green)', marginTop: 10 },
  table: { width: '100%', textAlign: 'left', borderCollapse: 'collapse' },
  pill: (color) => ({ padding: '4px 8px', borderRadius: 6, background: color + '20', color: color, fontSize: 12, fontWeight: 700 })
};
