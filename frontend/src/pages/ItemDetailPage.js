import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchItemRequest, deleteItemRequest } from '../store/slices/itemSlice';
import { fetchItemClaimsRequest, submitClaimRequest, updateClaimStatusRequest } from '../store/slices/claimSlice';
import { formatDistanceToNow, format } from 'date-fns';

const CAT_ICONS = { electronics:'',clothing:'',books:'',accessories:'',documents:'',sports:'',keys:'',bags:'',other:'' };

export default function ItemDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: item, loading } = useSelector(s => s.items);
  const { itemClaims, loading: claimLoading } = useSelector(s => s.claims);
  const { user } = useSelector(s => s.auth);
  const [claimDesc, setClaimDesc] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);

  const isOwner = item && String(item.reportedBy?.id) === String(user?.id);
  const alreadyClaimed = (itemClaims || []).some(c => String(c.claimant_id) === String(user?.id));

  useEffect(() => {
    dispatch(fetchItemRequest(id));
    dispatch(fetchItemClaimsRequest(id));
  }, [id, dispatch]);

  const handleClaim = (e) => {
    e.preventDefault();
    if (!claimDesc.trim()) return;
    dispatch(submitClaimRequest({ item_id: id, description: claimDesc }));
    setClaimDesc('');
    setShowClaimForm(false);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this item?')) {
      dispatch(deleteItemRequest(id));
      navigate('/items');
    }
  };

  const handleStatusUpdate = (itemStatus) => {
    dispatch({ type: 'items/updateItemRequest', payload: { id, data: { status: itemStatus } } });
  };

  if (loading || !item) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}></div>
      <p style={{ color: 'var(--gray-400)' }}>Loading item details...</p>
    </div>
  );

  const isLost = item.type === 'lost';

  return (
    <div style={S.page}>
      <button onClick={() => navigate(-1)} style={S.backBtn}>← Back</button>

      <div style={S.layout}>
        {/* Main info */}
        <div style={S.main}>
          <div style={S.card}>
            <div style={{ ...S.typeHeader, background: isLost ? 'linear-gradient(135deg,#fef2f2,#fee2e2)' : 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}>
              <div>
                <span style={{ ...S.typePill, background: isLost ? '#ef4444' : '#16a34a', color: 'white' }}>
                  {isLost ? ' LOST' : ' FOUND'}
                </span>
                <h1 style={S.title}>{item.title}</h1>
              </div>
              <div style={S.bigCatIcon}>{CAT_ICONS[item.category] || ''}</div>
            </div>

            <div style={S.body}>
              <div style={S.metaRow}>
                <div style={S.metaChip}> {item.location}</div>
                <div style={S.metaChip}> {item.category}</div>
                <div style={S.metaChip}> {formatDistanceToNow(new Date(item?.createdAt || item?.date || Date.now()), { addSuffix: true })}</div>
                <div style={{ ...S.metaChip, ...S.statusChip(item.status) }}>{item.status}</div>
              </div>

              <h3 style={S.sectionLabel}>Description</h3>
              <p style={S.desc}>{item.description}</p>

              {item.tags?.length > 0 && (
                <>
                  <h3 style={S.sectionLabel}>Tags</h3>
                  <div style={S.tags}>
                    {(item.tags || []).map(t => <span key={t} style={S.tag}># {t}</span>)}
                  </div>
                </>
              )}

              <div style={S.reported}>
                <div style={{ ...S.avatar, background: '#4ac68a' }}>
                  {item.reportedBy?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={S.reportedName}>{item.reportedBy?.name}</div>
                  <div style={S.reportedMeta}>Reported on {format(new Date(item?.createdAt || item?.date || Date.now()), 'MMM d, yyyy')}</div>
                </div>
              </div>

              {/* Owner actions */}
              {isOwner && (
                <div style={S.ownerActions}>
                  <h3 style={S.sectionLabel}>Manage This Item</h3>
                  <div style={S.ownerBtns}>
                    {item.status === 'active' && (
                      <button onClick={() => handleStatusUpdate('resolved')} style={S.resolveBtn}> Mark Resolved</button>
                    )}
                    <button onClick={handleDelete} style={S.deleteBtn}> Delete</button>
                  </div>
                </div>
              )}

              {/* Claim button */}
              {!isOwner && item.status === 'active' && (
                <div style={S.claimSection}>
                  {alreadyClaimed ? (
                    <div style={S.alreadyClaimed}> You have already submitted a claim for this item</div>
                  ) : (
                    <>
                      {!showClaimForm ? (
                        <button onClick={() => setShowClaimForm(true)} style={S.claimBtn}>
                          {isLost ? ' I Found This' : ' Claim This Item'}
                        </button>
                      ) : (
                        <form onSubmit={handleClaim} style={S.claimForm}>
                          <h3 style={S.sectionLabel}>{isLost ? 'Report as Found' : 'Submit Claim'}</h3>
                          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 12 }}>
                            {isLost ? 'Describe where you found it or any details to help the owner verify.' : 'Describe why this item belongs to you or how you can prove ownership.'}
                          </p>
                          <textarea
                            style={S.claimTextarea}
                            value={claimDesc}
                            onChange={e => setClaimDesc(e.target.value)}
                            placeholder="e.g. This is my calculator, it has my name written on the back and a sticker of a cat..."
                            rows={4} required
                          />
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button type="submit" style={S.submitClaim} disabled={claimLoading}>
                              {claimLoading ? 'Submitting...' : 'Submit Claim →'}
                            </button>
                            <button type="button" onClick={() => setShowClaimForm(false)} style={S.cancelClaim}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Claims sidebar */}
        <div style={S.sidebar}>
          <div style={S.claimsPanel}>
            <h3 style={S.panelTitle}> Claims ({itemClaims.length})</h3>
            {itemClaims.length === 0 ? (
              <div style={S.noClaims}>No claims yet</div>
            ) : (
              (itemClaims || []).map(claim => (
                <div key={claim.id} style={S.claimCard}>
                  <div style={S.claimHeader}>
                    <div style={{ ...S.claimAvatar, background: '#4ac68a' }}>
                      {claim.claimant_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={S.claimantName}>{claim.claimant_name}</div>
                      <div style={S.claimDate}>{formatDistanceToNow(new Date(claim?.created_at || Date.now()), { addSuffix: true })}</div>
                    </div>
                    <span style={{ ...S.claimStatus, ...claimStatusStyle(claim.status) }}>
                      {claim.status}
                    </span>
                  </div>
                  <p style={S.claimDesc}>{claim.description}</p>
                  {isOwner && claim.status === 'pending' && (
                    <div style={S.claimActions}>
                      <button onClick={() => dispatch(updateClaimStatusRequest({ id: claim.id, status: 'approved' }))}
                        style={S.approveBtn}> Approve</button>
                      <button onClick={() => dispatch(updateClaimStatusRequest({ id: claim.id, status: 'rejected' }))}
                        style={S.rejectBtn}> Reject</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const claimStatusStyle = (status) => {
  if (status === 'approved') return { background: '#dcfce7', color: '#16a34a' };
  if (status === 'rejected') return { background: '#fef2f2', color: '#ef4444' };
  return { background: '#fef9c3', color: '#a16207' };
};

const S = {
  page: { padding: '24px 40px', maxWidth: 1200, margin: '0 auto' },
  backBtn: { background: 'none', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '8px 14px', fontSize: 14, color: 'var(--gray-500)', marginBottom: 20, cursor: 'pointer' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' },
  main: {},
  card: { background: 'white', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow)' },
  typeHeader: { padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  typePill: { display: 'inline-block', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, letterSpacing: 1, marginBottom: 10 },
  title: { fontFamily: "'Fraunces', serif", fontSize: 28, color: 'var(--gray-800)', lineHeight: 1.2 },
  bigCatIcon: { fontSize: 56 },
  body: { padding: '24px 32px' },
  metaRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  metaChip: { fontSize: 12, padding: '5px 12px', background: 'var(--gray-100)', borderRadius: 8, color: 'var(--gray-600)' },
  statusChip: (s) => ({ background: s === 'active' ? '#dcfce7' : s === 'resolved' ? '#ede9fe' : '#fef9c3', color: s === 'active' ? '#16a34a' : s === 'resolved' ? '#7c3aed' : '#a16207', fontWeight: 600 }),
  sectionLabel: { fontSize: 13, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 20 },
  desc: { fontSize: 15, color: 'var(--gray-600)', lineHeight: 1.7 },
  tags: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tag: { fontSize: 12, padding: '4px 10px', background: 'var(--lavender)', color: 'var(--purple)', borderRadius: 6 },
  reported: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0', borderTop: '1px solid var(--gray-100)', marginTop: 20 },
  avatar: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 },
  reportedName: { fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' },
  reportedMeta: { fontSize: 12, color: 'var(--gray-400)' },
  ownerActions: { borderTop: '1px solid var(--gray-100)', paddingTop: 16, marginTop: 4 },
  ownerBtns: { display: 'flex', gap: 10 },
  resolveBtn: { padding: '10px 18px', background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  deleteBtn: { padding: '10px 18px', background: '#fef2f2', color: '#ef4444', border: '1.5px solid #fecaca', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  claimSection: { borderTop: '1px solid var(--gray-100)', paddingTop: 20, marginTop: 8 },
  alreadyClaimed: { padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, color: '#16a34a', fontSize: 14 },
  claimBtn: { padding: '12px 24px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  claimForm: { background: 'var(--gray-50)', borderRadius: 14, padding: 20 },
  claimTextarea: { width: '100%', padding: '12px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 10, fontSize: 14, resize: 'vertical', outline: 'none', marginBottom: 12, fontFamily: 'inherit' },
  submitClaim: { padding: '10px 20px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' },
  cancelClaim: { padding: '10px 16px', background: 'none', border: '1px solid var(--gray-200)', borderRadius: 10, color: 'var(--gray-500)', cursor: 'pointer' },
  sidebar: {},
  claimsPanel: { background: 'white', borderRadius: 20, padding: 20, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' },
  panelTitle: { fontFamily: "'Fraunces', serif", fontSize: 18, marginBottom: 16, color: 'var(--gray-800)' },
  noClaims: { color: 'var(--gray-400)', fontSize: 14, textAlign: 'center', padding: '24px 0' },
  claimCard: { padding: '14px 0', borderBottom: '1px solid var(--gray-100)' },
  claimHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  claimAvatar: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 },
  claimantName: { fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' },
  claimDate: { fontSize: 11, color: 'var(--gray-400)' },
  claimStatus: { marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' },
  claimDesc: { fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5 },
  claimActions: { display: 'flex', gap: 8, marginTop: 10 },
  approveBtn: { flex: 1, padding: '7px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' },
  rejectBtn: { flex: 1, padding: '7px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' },
};
