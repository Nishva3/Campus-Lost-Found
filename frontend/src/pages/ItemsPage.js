import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchItemsRequest, setFilters } from '../store/slices/itemSlice';
import { formatDistanceToNow } from 'date-fns';

const CAT_ICONS = { electronics:'',clothing:'',books:'',accessories:'',documents:'',sports:'',keys:'',bags:'',other:'' };
const CATS = ['electronics','clothing','books','accessories','documents','sports','keys','bags','other'];
const LOCATIONS = ['Library','Cafeteria','Main Gate','Lab Block','Hostel A','Hostel B','Sports Complex','Admin Block','Parking Lot','Auditorium'];

const ItemCard = ({ item }) => {
  const isLost = item.type === 'lost';
  return (
    <Link to={`/items/${item._id}`} style={S.card} className="fade-in">
      <div style={{ ...S.typeBar, background: isLost ? '#ef4444' : '#16a34a' }} />
      <div style={S.cardBody}>
        <div style={S.cardTop}>
          <span style={{ ...S.typePill, background: isLost ? '#fef2f2' : '#f0fdf4', color: isLost ? '#ef4444' : '#16a34a' }}>
            {isLost ? ' Lost' : ' Found'}
          </span>
          <span style={S.catChip}>{CAT_ICONS[item.category]} {item.category}</span>
        </div>
        <h3 style={S.cardTitle}>{item.title}</h3>
        <p style={S.cardDesc}>{item.description?.slice(0, 80)}{item.description?.length > 80 ? '...' : ''}</p>
        <div style={S.cardMeta}>
          <span> {item.location}</span>
          <span> {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
        </div>
        <div style={S.cardFooter}>
          <span style={S.reportedBy}>by {item.reportedBy?.name}</span>
          {item.claimCount > 0 && <span style={S.claimBadge}>{item.claimCount} claim{item.claimCount > 1 ? 's' : ''}</span>}
          <span style={{ ...S.statusPill, background: item.status === 'active' ? '#dcfce7' : '#fef9c3', color: item.status === 'active' ? '#16a34a' : '#a16207' }}>
            {item.status}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default function ItemsPage() {
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const { list, loading, total, filters } = useSelector(s => s.items);
  const [search, setSearch] = useState('');

  const activeType = params.get('type') || filters.type || '';
  const activeCategory = params.get('category') || filters.category || '';

  useEffect(() => {
    dispatch(fetchItemsRequest({ type: activeType, category: activeCategory, status: 'active' }));
  }, [dispatch, activeType, activeCategory]);

  const applyFilters = (newFilters) => {
    const merged = { type: activeType, category: activeCategory, ...newFilters };
    dispatch(setFilters(merged));
    dispatch(fetchItemsRequest(merged));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchItemsRequest({ type: activeType, category: activeCategory, search, status: '' }));
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Browse Items</h1>
          <p style={S.sub}>{total} item{total !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/report" style={S.reportBtn}>+ Report Item</Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={S.searchBar}>
        <input style={S.searchInput} value={search} onChange={e => setSearch(e.target.value)} placeholder=" Search by name, location, tags..." />
        <button type="submit" style={S.searchBtn}>Search</button>
      </form>

      <div style={S.layout}>
        {/* Sidebar filters */}
        <div style={S.sidebar}>
          <div style={S.filterGroup}>
            <h4 style={S.filterTitle}>Type</h4>
            {[['', 'All'], ['lost', ' Lost'], ['found', ' Found']].map(([v, l]) => (
              <button key={v} onClick={() => applyFilters({ type: v })}
                style={{ ...S.filterBtn, ...(activeType === v ? S.filterBtnActive : {}) }}>{l}</button>
            ))}
          </div>
          <div style={S.filterGroup}>
            <h4 style={S.filterTitle}>Category</h4>
            {['', ...CATS].map(c => (
              <button key={c} onClick={() => applyFilters({ category: c })}
                style={{ ...S.filterBtn, ...(activeCategory === c ? S.filterBtnActive : {}) }}>
                {c ? `${CAT_ICONS[c]} ${c}` : 'All Categories'}
              </button>
            ))}
          </div>
          <div style={S.filterGroup}>
            <h4 style={S.filterTitle}>Location</h4>
            {LOCATIONS.map(l => (
              <button key={l} onClick={() => dispatch(fetchItemsRequest({ type: activeType, category: activeCategory, location: l }))}
                style={S.filterBtn}> {l}</button>
            ))}
          </div>
        </div>

        {/* Items grid */}
        <div style={S.main}>
          {loading ? (
            <div style={S.grid}>
              {[...Array(6)].map((_, i) => <div key={i} style={S.skeleton} className="skeleton" />)}
            </div>
          ) : list.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 64 }}></div>
              <h3 style={S.emptyTitle}>No items found</h3>
              <p style={S.emptySub}>Try adjusting your filters or be the first to report!</p>
              <Link to="/report" style={S.emptyBtn}>Report an Item</Link>
            </div>
          ) : (
            <div style={S.grid}>
              {list.map(item => <ItemCard key={item._id} item={item} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { padding: '32px 40px', maxWidth: 1300, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontFamily: "'Fraunces', serif", fontSize: 32, color: 'var(--gray-800)' },
  sub: { color: 'var(--gray-400)', fontSize: 14, marginTop: 4 },
  reportBtn: {
    padding: '10px 20px', background: 'var(--green)', color: 'white',
    borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none',
  },
  searchBar: { display: 'flex', gap: 10, marginBottom: 28 },
  searchInput: {
    flex: 1, padding: '12px 16px', border: '1.5px solid var(--gray-200)',
    borderRadius: 12, fontSize: 14, background: 'white', outline: 'none',
  },
  searchBtn: {
    padding: '12px 24px', background: 'var(--green)', color: 'white',
    border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14,
  },
  layout: { display: 'flex', gap: 28 },
  sidebar: { width: 210, flexShrink: 0 },
  filterGroup: { background: 'white', borderRadius: 14, padding: 16, marginBottom: 14, border: '1px solid var(--gray-100)' },
  filterTitle: { fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  filterBtn: {
    display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px',
    border: 'none', borderRadius: 8, background: 'none',
    fontSize: 13, color: 'var(--gray-600)', marginBottom: 2, cursor: 'pointer', textTransform: 'capitalize',
  },
  filterBtnActive: { background: 'var(--mint)', color: 'var(--green-dark)', fontWeight: 600 },
  main: { flex: 1 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 },
  skeleton: { height: 220, borderRadius: 16 },
  card: {
    background: 'white', borderRadius: 16, border: '1px solid var(--gray-100)',
    overflow: 'hidden', textDecoration: 'none', display: 'flex',
    flexDirection: 'row', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s',
  },
  typeBar: { width: 5, flexShrink: 0 },
  cardBody: { flex: 1, padding: '16px 18px' },
  cardTop: { display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  typePill: { fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 },
  catChip: { fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--gray-100)', color: 'var(--gray-500)', textTransform: 'capitalize' },
  cardTitle: { fontFamily: "'Fraunces', serif", fontSize: 16, color: 'var(--gray-800)', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: 'var(--gray-500)', marginBottom: 10, lineHeight: 1.5 },
  cardMeta: { display: 'flex', gap: 14, fontSize: 12, color: 'var(--gray-400)', marginBottom: 10, flexWrap: 'wrap' },
  cardFooter: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  reportedBy: { fontSize: 12, color: 'var(--gray-400)', flex: 1 },
  claimBadge: { fontSize: 11, background: 'var(--peach)', color: 'var(--coral)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 },
  statusPill: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6 },
  empty: { textAlign: 'center', padding: '80px 40px' },
  emptyTitle: { fontFamily: "'Fraunces', serif", fontSize: 22, margin: '16px 0 8px', color: 'var(--gray-700)' },
  emptySub: { color: 'var(--gray-400)', fontSize: 14, marginBottom: 24 },
  emptyBtn: { padding: '12px 24px', background: 'var(--green)', color: 'white', borderRadius: 12, fontWeight: 600, textDecoration: 'none' },
};
