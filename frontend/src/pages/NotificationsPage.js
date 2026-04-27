import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotificationsRequest } from '../store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG = {
  claim_received: { icon: '', color: '#3b82f6', bg: '#eff6ff', label: 'Claim Received' },
  claim_approved: { icon: '', color: '#16a34a', bg: '#f0fdf4', label: 'Claim Approved' },
  claim_rejected: { icon: '', color: '#ef4444', bg: '#fef2f2', label: 'Claim Rejected' },
  item_matched: { icon: '', color: '#7c3aed', bg: '#f5f3ff', label: 'Item Matched' },
  system: { icon: '', color: '#f59e0b', bg: '#fffbeb', label: 'System' },
};

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { list, loading } = useSelector(s => s.notifications);

  useEffect(() => {
    dispatch(fetchNotificationsRequest(user?.id));
  }, [dispatch, user]);

  const handleMarkRead = (id) => {
    dispatch({ type: 'notifications/markReadRequest', payload: id });
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}> Notifications</h1>
        <p style={S.sub}>{list.filter(n => !n.read).length} unread</p>
      </div>

      {loading ? (
        <div style={S.center}>Loading notifications...</div>
      ) : list.length === 0 ? (
        <div style={S.empty}>
          <div style={{ fontSize: 64 }}></div>
          <h3 style={S.emptyTitle}>No notifications yet</h3>
          <p style={S.emptySub}>You'll be notified when someone claims your item or your claim is reviewed.</p>
        </div>
      ) : (
        <div style={S.list}>
          {list.map(notif => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
            return (
              <div
                key={notif._id}
                style={{
                  ...S.card,
                  background: notif.read ? 'white' : cfg.bg,
                  borderLeft: `4px solid ${cfg.color}`
                }}
                onClick={() => !notif.read && handleMarkRead(notif._id)}
              >
                <div style={S.iconWrap}>
                  <span style={{ fontSize: 28 }}>{cfg.icon}</span>
                </div>
                <div style={S.content}>
                  <div style={S.notifTitle}>{notif.title}</div>
                  <div style={S.message}>{notif.message}</div>
                  <div style={S.meta}>
                    <span style={{ ...S.typeBadge, background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span style={S.time}>
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                {!notif.read && <div style={S.unreadDot} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const S = {
  page: { padding: '32px 40px', maxWidth: 800, margin: '0 auto' },
  header: { marginBottom: 28 },
  title: { fontFamily: "'Fraunces', serif", fontSize: 32, color: '#1f2937' },
  sub: { color: '#9ca3af', fontSize: 14, marginTop: 4 },
  center: { textAlign: 'center', padding: 40, color: '#9ca3af' },
  empty: { textAlign: 'center', padding: '80px 40px' },
  emptyTitle: { fontFamily: "'Fraunces', serif", fontSize: 22, margin: '16px 0 8px', color: '#374151' },
  emptySub: { color: '#9ca3af', fontSize: 14 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    display: 'flex', alignItems: 'flex-start', gap: 16,
    padding: '16px 20px', borderRadius: 14,
    border: '1px solid #f3f4f6', cursor: 'pointer',
    transition: 'all 0.2s', position: 'relative',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  iconWrap: {
    flexShrink: 0, width: 44, height: 44, borderRadius: 12,
    background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  content: { flex: 1 },
  notifTitle: { fontWeight: 700, fontSize: 15, color: '#1f2937', marginBottom: 4 },
  message: { fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginBottom: 8 },
  meta: { display: 'flex', alignItems: 'center', gap: 10 },
  typeBadge: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6 },
  time: { fontSize: 11, color: '#9ca3af' },
  unreadDot: { width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: 6 },
};