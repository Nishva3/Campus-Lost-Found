import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyItemsRequest, deleteItemRequest } from '../store/slices/itemSlice';
import { formatDistanceToNow } from 'date-fns';

const CAT_ICONS = { electronics:'',clothing:'',books:'',accessories:'',documents:'',sports:'',keys:'',bags:'',other:'' };

export default function MyItemsPage() {
  const dispatch = useDispatch();
  const { myItems, loading } = useSelector(s => s.items);

  useEffect(() => { dispatch(fetchMyItemsRequest()); }, [dispatch]);

  const lost = myItems.filter(i => i.type === 'lost');
  const found = myItems.filter(i => i.type === 'found');

  const Section = ({ title, items, color }) => (
    <div style={S.section}>
      <h2 style={{ ...S.sectionTitle, color }}>{title} ({items.length})</h2>
      {items.length === 0 ? (
        <div style={S.empty}>No items here yet</div>
      ) : (
        <div style={S.grid}>
          {items.map(item => (
            <div key={item._id} style={S.card} className="fade-in">
              <div style={S.cardTop}>
                <span style={{ fontSize: 24 }}>{CAT_ICONS[item.category]}</span>
                <div style={{ flex: 1 }}>
                  <Link to={`/items/${item._id}`} style={S.cardTitle}>{item.title}</Link>
                  <div style={S.cardMeta}> {item.location} · {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</div>
                </div>
                <span style={{ ...S.statusBadge, ...(item.status === 'active' ? S.active : item.status === 'resolved' ? S.resolved : S.claimed) }}>
                  {item.status}
                </span>
              </div>
              <p style={S.cardDesc}>{item.description?.slice(0, 100)}...</p>
              <div style={S.cardFooter}>
                <span style={S.claims}> {item.claimCount || 0} claim{item.claimCount !== 1 ? 's' : ''}</span>
                <Link to={`/items/${item._id}`} style={S.viewBtn}>View →</Link>
                <button onClick={() => { if(window.confirm('Delete?')) dispatch(deleteItemRequest(item._id)); }} style={S.delBtn}></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>My Reported Items</h1>
        <Link to="/report" style={S.reportBtn}>+ Report New Item</Link>
      </div>
      {loading ? <div style={S.loading}>Loading your items...</div> : (
        <>
          <Section title=" Lost Items" items={lost} color="#ef4444" />
          <Section title=" Found Items" items={found} color="#16a34a" />
        </>
      )}
    </div>
  );
}

const S = {
  page: { padding: '32px 40px', maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  title: { fontFamily: "'Fraunces', serif", fontSize: 32, color: 'var(--gray-800)' },
  reportBtn: { padding: '10px 20px', background: 'var(--green)', color: 'white', borderRadius: 10, fontWeight: 600, textDecoration: 'none' },
  loading: { textAlign: 'center', padding: 60, color: 'var(--gray-400)' },
  section: { marginBottom: 36 },
  sectionTitle: { fontFamily: "'Fraunces', serif", fontSize: 22, marginBottom: 16 },
  empty: { background: 'white', borderRadius: 14, padding: '32px', textAlign: 'center', color: 'var(--gray-400)', border: '1px solid var(--gray-100)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card: { background: 'white', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: 'var(--gray-800)', textDecoration: 'none', display: 'block' },
  cardMeta: { fontSize: 12, color: 'var(--gray-400)', marginTop: 3 },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', flexShrink: 0 },
  active: { background: '#dcfce7', color: '#16a34a' },
  resolved: { background: '#ede9fe', color: '#7c3aed' },
  claimed: { background: '#fef9c3', color: '#a16207' },
  cardDesc: { fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 14 },
  cardFooter: { display: 'flex', alignItems: 'center', gap: 10 },
  claims: { fontSize: 12, color: 'var(--gray-400)', flex: 1 },
  viewBtn: { fontSize: 12, color: 'var(--green)', fontWeight: 600, textDecoration: 'none', padding: '6px 12px', background: 'var(--mint)', borderRadius: 8 },
  delBtn: { background: 'none', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 14 },
};
