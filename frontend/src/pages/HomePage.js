import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchStatsRequest } from '../store/slices/itemSlice';
import { fetchClaimStatsRequest } from '../store/slices/claimSlice';
import { fetchTrendingRequest } from '../store/slices/searchSlice';

const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{ ...S.statCard, background: bg }}>
    <div style={{ ...S.statIcon, background: color + '22', color }}>{icon}</div>
    <div>
      <div style={S.statValue}>{value ?? '—'}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  </div>
);

export default function HomePage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { stats } = useSelector(s => s.items);
  const { stats: claimStats } = useSelector(s => s.claims);
  const { trending } = useSelector(s => s.search);

  useEffect(() => {
    dispatch(fetchStatsRequest());
    dispatch(fetchClaimStatsRequest());
    dispatch(fetchTrendingRequest());
    const interval = setInterval(() => {
      dispatch(fetchStatsRequest());
      dispatch(fetchClaimStatsRequest());
    }, 15000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={S.page}>
      {/* Hero */}
      <div style={S.hero}>
        <div style={S.heroLeft}>
          <div style={S.greetPill}> Campus Portal</div>
          <h1 style={S.heroTitle}>{greeting}, <br /><em>{user?.name?.split(' ')[0]}</em> </h1>
          <p style={S.heroSub}>Find lost items or help others by reporting what you've found on campus.</p>
          <div style={S.heroBtns}>
            <Link to="/report" style={S.btnPrimary}> Report Item</Link>
            <Link to="/items" style={S.btnSecondary}> Browse Items</Link>
          </div>
        </div>
        <div style={S.heroRight}>
          <div style={S.bigIcon}></div>
        </div>
      </div>

      {/* Stats */}
      <div style={S.section}>
        <div style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>Live Statistics</h2>
          <span style={S.liveTag}> Live</span>
        </div>
        <div style={S.statsGrid}>
          <StatCard icon="" label="Total Items" value={stats?.total} color="#2d9b6f" bg="var(--mint)" />
          <StatCard icon="" label="Lost Items" value={stats?.lost} color="#ef4444" bg="#fef2f2" />
          <StatCard icon="" label="Found Items" value={stats?.found} color="#16a34a" bg="#f0fdf4" />
          <StatCard icon="" label="Resolved" value={stats?.resolved} color="#7c3aed" bg="var(--lavender)" />
          <StatCard icon="" label="Total Claims" value={claimStats?.total} color="#f59e0b" bg="var(--yellow)" />
          <StatCard icon="" label="Pending Claims" value={claimStats?.pending} color="#f97316" bg="var(--peach)" />
        </div>
      </div>

      {/* Trending + Quick Actions */}
      <div style={S.twoCol}>
        <div style={S.panel}>
          <h3 style={S.panelTitle}> Trending Items</h3>
          {trending.length === 0 ? (
            <div style={S.empty}>No trending items yet</div>
          ) : (
            trending.map(item => (
              <Link to={`/items/${item._id}`} key={item._id} style={S.trendItem}>
                <span style={{ ...S.trendBadge, background: item.type === 'lost' ? '#fef2f2' : '#f0fdf4', color: item.type === 'lost' ? '#ef4444' : '#16a34a' }}>
                  {item.type === 'lost' ? 'Lost' : 'Found'}
                </span>
                <div style={S.trendInfo}>
                  <span style={S.trendName}>{item.title}</span>
                  <span style={S.trendMeta}> {item.location} · {item.claimCount || 0} claims</span>
                </div>
                <span style={S.trendArrow}>→</span>
              </Link>
            ))
          )}
        </div>

        <div style={S.panel}>
          <h3 style={S.panelTitle}> Quick Actions</h3>
          <div style={S.quickGrid}>
            {[
              { to: '/report', icon: '', label: 'Report Lost', sub: 'Lost something?', color: '#fef2f2', border: '#fecaca' },
              { to: '/report', icon: '', label: 'Report Found', sub: 'Found something?', color: '#f0fdf4', border: '#bbf7d0' },
              { to: '/items?type=lost', icon: '', label: 'Search Lost', sub: 'Browse lost items', color: 'var(--sky)', border: '#bfdbfe' },
              { to: '/claims', icon: '', label: 'My Claims', sub: 'Track your claims', color: 'var(--lavender)', border: '#ddd6fe' },
            ].map(a => (
              <Link key={a.label} to={a.to} style={{ ...S.quickCard, background: a.color, borderColor: a.border }}>
                <span style={S.quickIcon}>{a.icon}</span>
                <span style={S.quickLabel}>{a.label}</span>
                <span style={S.quickSub}>{a.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {stats?.categories?.length > 0 && (
        <div style={S.section}>
          <h2 style={S.sectionTitle}>Items by Category</h2>
          <div style={S.catGrid}>
            {stats.categories.slice(0, 8).map(c => (
              <Link key={c._id} to={`/items?category=${c._id}`} style={S.catCard}>
                <span style={S.catIcon}>{CAT_ICONS[c._id] || ''}</span>
                <span style={S.catName}>{c._id}</span>
                <span style={S.catCount}>{c.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const CAT_ICONS = {
  electronics: '', clothing: '', books: '', accessories: '',
  documents: '', sports: '', keys: '', bags: '', other: '',
};

const S = {
  page: { padding: '32px 40px', maxWidth: 1200, margin: '0 auto' },
  hero: {
    background: 'linear-gradient(135deg, var(--mint) 0%, #f0fdf4 100%)',
    borderRadius: 24, padding: '40px 48px', marginBottom: 36,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    border: '1px solid var(--mint-mid)',
  },
  heroLeft: { flex: 1 },
  heroRight: { flexShrink: 0 },
  greetPill: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'white', border: '1px solid var(--mint-mid)',
    borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 600,
    color: 'var(--green)', marginBottom: 16,
  },
  heroTitle: {
    fontFamily: "'Fraunces', serif", fontSize: 42, fontWeight: 700,
    color: 'var(--gray-800)', lineHeight: 1.2, marginBottom: 14,
  },
  heroSub: { color: 'var(--gray-500)', fontSize: 16, marginBottom: 28, maxWidth: 400 },
  heroBtns: { display: 'flex', gap: 12 },
  btnPrimary: {
    padding: '12px 24px', background: 'var(--green)', color: 'white',
    borderRadius: 12, fontWeight: 600, fontSize: 15, textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(45,155,111,0.3)',
  },
  btnSecondary: {
    padding: '12px 24px', background: 'white', color: 'var(--gray-700)',
    borderRadius: 12, fontWeight: 600, fontSize: 15, textDecoration: 'none',
    border: '1.5px solid var(--gray-200)',
  },
  bigIcon: { fontSize: 96 },
  section: { marginBottom: 36 },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  sectionTitle: { fontFamily: "'Fraunces', serif", fontSize: 22, color: 'var(--gray-800)' },
  liveTag: { fontSize: 12, color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '2px 10px', borderRadius: 99 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 },
  statCard: {
    borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
    border: '1px solid rgba(0,0,0,0.04)',
  },
  statIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
  statValue: { fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: 'var(--gray-800)', lineHeight: 1 },
  statLabel: { fontSize: 12, color: 'var(--gray-500)', marginTop: 4 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 36 },
  panel: { background: 'white', borderRadius: 20, padding: 24, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' },
  panelTitle: { fontFamily: "'Fraunces', serif", fontSize: 18, marginBottom: 16, color: 'var(--gray-800)' },
  empty: { color: 'var(--gray-400)', fontSize: 14, textAlign: 'center', padding: '24px 0' },
  trendItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
    borderBottom: '1px solid var(--gray-100)', textDecoration: 'none',
  },
  trendBadge: { fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, flexShrink: 0 },
  trendInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  trendName: { fontSize: 14, fontWeight: 500, color: 'var(--gray-700)' },
  trendMeta: { fontSize: 12, color: 'var(--gray-400)', marginTop: 2 },
  trendArrow: { color: 'var(--gray-300)', fontSize: 16 },
  quickGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  quickCard: {
    display: 'flex', flexDirection: 'column', gap: 4,
    padding: '16px', borderRadius: 14, border: '1.5px solid',
    textDecoration: 'none', transition: 'transform 0.15s',
  },
  quickIcon: { fontSize: 24, marginBottom: 4 },
  quickLabel: { fontSize: 13, fontWeight: 700, color: 'var(--gray-700)' },
  quickSub: { fontSize: 11, color: 'var(--gray-400)' },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 },
  catCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: '18px 12px', background: 'white', borderRadius: 16,
    border: '1px solid var(--gray-100)', textDecoration: 'none', transition: 'all 0.15s',
  },
  catIcon: { fontSize: 28 },
  catName: { fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', textTransform: 'capitalize' },
  catCount: { fontSize: 12, color: 'var(--gray-400)' },
};
