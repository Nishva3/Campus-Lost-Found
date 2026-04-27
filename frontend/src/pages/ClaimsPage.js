import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyClaimsRequest } from '../store/slices/claimSlice';
import { formatDistanceToNow } from 'date-fns';

const statusColors = {
  pending: { bg: '#fef9c3', color: '#a16207', label: ' Pending' },
  approved: { bg: '#dcfce7', color: '#16a34a', label: ' Approved' },
  rejected: { bg: '#fef2f2', color: '#ef4444', label: ' Rejected' },
};

export default function ClaimsPage() {
  const dispatch = useDispatch();
  const { myClaims, loading } = useSelector(s => s.claims);

  useEffect(() => { dispatch(fetchMyClaimsRequest()); }, [dispatch]);

  const pending = myClaims.filter(c => c.status === 'pending');
  const approved = myClaims.filter(c => c.status === 'approved');
  const rejected = myClaims.filter(c => c.status === 'rejected');

  return (
    <div style={S.page}>
      <h1 style={S.title}>My Claims</h1>

      {/* Summary */}
      <div style={S.summaryRow}>
        {[
          { label: 'Total Claims', val: myClaims.length, bg: 'var(--sky)', color: 'var(--blue)' },
          { label: 'Pending', val: pending.length, bg: 'var(--yellow)', color: '#a16207' },
          { label: 'Approved', val: approved.length, bg: '#f0fdf4', color: '#16a34a' },
          { label: 'Rejected', val: rejected.length, bg: '#fef2f2', color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ ...S.summaryCard, background: s.bg }}>
            <div style={{ ...S.summaryVal, color: s.color }}>{s.val}</div>
            <div style={S.summaryLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={S.loading}>Loading your claims...</div>
      ) : myClaims.length === 0 ? (
        <div style={S.empty}>
          <div style={{ fontSize: 56 }}></div>
          <h3 style={S.emptyTitle}>No claims yet</h3>
          <p style={S.emptySub}>Browse items and submit a claim if you recognize something as yours.</p>
          <Link to="/items" style={S.browseBtn}>Browse Items →</Link>
        </div>
      ) : (
        <div style={S.list}>
          {myClaims.map(claim => {
            const sc = statusColors[claim.status] || statusColors.pending;
            return (
              <div key={claim.id} style={S.claimCard} className="fade-in">
                <div style={S.claimLeft}>
                  <span style={{ ...S.statusBadge, background: sc.bg, color: sc.color }}>{sc.label}</span>
                  <div style={S.itemId}>Item #{claim.item_id?.slice(0, 8)}...</div>
                  <p style={S.claimDesc}>{claim.description}</p>
                  <div style={S.claimMeta}>
                    Submitted {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
                    {claim.updated_at !== claim.created_at && ` · Updated ${formatDistanceToNow(new Date(claim.updated_at), { addSuffix: true })}`}
                  </div>
                </div>
                <Link to={`/items/${claim.item_id}`} style={S.viewItemBtn}>View Item →</Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const S = {
  page: { padding: '32px 40px', maxWidth: 900, margin: '0 auto' },
  title: { fontFamily: "'Fraunces', serif", fontSize: 32, color: 'var(--gray-800)', marginBottom: 24 },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 },
  summaryCard: { borderRadius: 14, padding: '18px 20px', border: '1px solid rgba(0,0,0,0.04)' },
  summaryVal: { fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700, lineHeight: 1 },
  summaryLabel: { fontSize: 13, color: 'var(--gray-500)', marginTop: 6 },
  loading: { textAlign: 'center', padding: 60, color: 'var(--gray-400)' },
  empty: { textAlign: 'center', padding: '80px 40px' },
  emptyTitle: { fontFamily: "'Fraunces', serif", fontSize: 22, margin: '16px 0 8px', color: 'var(--gray-700)' },
  emptySub: { color: 'var(--gray-400)', fontSize: 14, marginBottom: 24 },
  browseBtn: { padding: '12px 24px', background: 'var(--green)', color: 'white', borderRadius: 12, fontWeight: 600, textDecoration: 'none' },
  list: { display: 'flex', flexDirection: 'column', gap: 14 },
  claimCard: {
    background: 'white', borderRadius: 16, padding: '20px 24px',
    border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)',
    display: 'flex', alignItems: 'flex-start', gap: 16,
  },
  claimLeft: { flex: 1 },
  statusBadge: { display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 7, marginBottom: 10 },
  itemId: { fontSize: 12, color: 'var(--gray-400)', marginBottom: 8, fontFamily: 'monospace' },
  claimDesc: { fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 10 },
  claimMeta: { fontSize: 12, color: 'var(--gray-400)' },
  viewItemBtn: { padding: '10px 16px', background: 'var(--mint)', color: 'var(--green-dark)', borderRadius: 10, fontWeight: 600, fontSize: 13, textDecoration: 'none', flexShrink: 0 },
};
