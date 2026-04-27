import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createItemRequest } from '../store/slices/itemSlice';

const CATS = ['electronics','clothing','books','accessories','documents','sports','keys','bags','other'];
const CAT_ICONS = { electronics:'',clothing:'',books:'',accessories:'',documents:'',sports:'',keys:'',bags:'',other:'' };
const LOCATIONS = ['Library','Cafeteria','Main Gate','Lab Block','Hostel A','Hostel B','Sports Complex','Admin Block','Parking Lot','Auditorium','Classroom 101','Classroom 201','Gym','Canteen'];

export default function ReportItemPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.items);
  const [form, setForm] = useState({ title: '', description: '', category: 'other', type: 'lost', location: '', tags: '' });
  const [tagInput, setTagInput] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    dispatch(createItemRequest({ ...form, tags }));
    setTimeout(() => navigate('/items'), 1500);
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Report an Item</h1>
        <p style={S.sub}>Fill in the details to help the community find or return items</p>
      </div>

      <div style={S.layout}>
        <form onSubmit={submit} style={S.form}>
          {/* Type toggle */}
          <div style={S.typeToggle}>
            {[['lost','','Lost','I lost something'], ['found','','Found','I found something']].map(([v, ico, l, sub]) => (
              <button type="button" key={v} onClick={() => set('type', v)}
                style={{ ...S.typeBtn, ...(form.type === v ? S.typeBtnActive(v) : {}) }}>
                <span style={{ fontSize: 28 }}>{ico}</span>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600 }}>{l}</span>
                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{sub}</span>
              </button>
            ))}
          </div>

          <div style={S.field}>
            <label style={S.label}>Item Title *</label>
            <input style={S.input} value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Blue HP Calculator, Red Water Bottle..." required />
          </div>

          <div style={S.row}>
            <div style={S.field}>
              <label style={S.label}>Category *</label>
              <select style={S.input} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATS.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Location *</label>
              <select style={S.input} value={form.location} onChange={e => set('location', e.target.value)} required>
                <option value="">Select location</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div style={S.field}>
            <label style={S.label}>Description *</label>
            <textarea style={{ ...S.input, resize: 'vertical' }} rows={4}
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe the item in detail — color, size, distinguishing features, when/where it was lost/found..."
              required />
          </div>

          <div style={S.field}>
            <label style={S.label}>Tags <span style={S.optLabel}>(comma separated)</span></label>
            <input style={S.input} value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="e.g. blue, calculator, HP, scientific" />
          </div>

          <button type="submit" disabled={loading} style={S.submitBtn}>
            {loading ? ' Reporting...' : `${form.type === 'lost' ? '' : ''} Report ${form.type === 'lost' ? 'Lost' : 'Found'} Item`}
          </button>
        </form>

        {/* Preview */}
        <div style={S.previewPanel}>
          <h3 style={S.previewTitle}>Preview</h3>
          <div style={S.previewCard}>
            <div style={{ ...S.previewType, background: form.type === 'lost' ? '#ef4444' : '#16a34a', color: 'white' }}>
              {form.type === 'lost' ? ' LOST' : ' FOUND'}
            </div>
            <div style={S.previewCat}>{CAT_ICONS[form.category]} {form.category}</div>
            <h3 style={S.previewName}>{form.title || 'Item title...'}</h3>
            <p style={S.previewDesc}>{form.description || 'Item description will appear here...'}</p>
            {form.location && <div style={S.previewLoc}> {form.location}</div>}
            {form.tags && (
              <div style={S.previewTags}>
                {form.tags.split(',').filter(Boolean).map((t, i) => (
                  <span key={i} style={S.previewTag}>#{t.trim()}</span>
                ))}
              </div>
            )}
          </div>

          <div style={S.tips}>
            <h4 style={S.tipsTitle}> Tips for better results</h4>
            <ul style={S.tipsList}>
              {[
                'Be specific about the item description',
                'Include brand, color, and size if applicable',
                'Mention exact location where item was lost/found',
                'Add distinguishing marks or features',
                'Use tags to improve searchability',
              ].map((tip, i) => <li key={i} style={S.tip}>{tip}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { padding: '32px 40px', maxWidth: 1200, margin: '0 auto' },
  header: { marginBottom: 32 },
  title: { fontFamily: "'Fraunces', serif", fontSize: 32, color: 'var(--gray-800)', marginBottom: 6 },
  sub: { color: 'var(--gray-500)', fontSize: 15 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' },
  form: { background: 'white', borderRadius: 20, padding: 32, border: '1px solid var(--gray-100)', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: 'var(--shadow-sm)' },
  typeToggle: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  typeBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '20px', borderRadius: 16, border: '2px solid var(--gray-200)', background: 'none', cursor: 'pointer', transition: 'all 0.2s' },
  typeBtnActive: (v) => ({ border: `2px solid ${v === 'lost' ? '#ef4444' : '#16a34a'}`, background: v === 'lost' ? '#fef2f2' : '#f0fdf4' }),
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--gray-600)' },
  optLabel: { fontWeight: 400, color: 'var(--gray-400)' },
  input: { padding: '11px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 10, fontSize: 14, background: 'white', outline: 'none', width: '100%' },
  submitBtn: { padding: '14px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 8 },
  previewPanel: { display: 'flex', flexDirection: 'column', gap: 16 },
  previewTitle: { fontFamily: "'Fraunces', serif", fontSize: 16, color: 'var(--gray-600)' },
  previewCard: { background: 'white', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' },
  previewType: { display: 'inline-block', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 6, marginBottom: 8, letterSpacing: 1 },
  previewCat: { fontSize: 12, color: 'var(--gray-400)', marginBottom: 10, textTransform: 'capitalize' },
  previewName: { fontFamily: "'Fraunces', serif", fontSize: 18, color: 'var(--gray-800)', marginBottom: 8 },
  previewDesc: { fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 10 },
  previewLoc: { fontSize: 12, color: 'var(--gray-400)', marginBottom: 10 },
  previewTags: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  previewTag: { fontSize: 11, padding: '2px 8px', background: 'var(--lavender)', color: 'var(--purple)', borderRadius: 5 },
  tips: { background: 'var(--yellow)', borderRadius: 14, padding: 18, border: '1px solid #fde68a' },
  tipsTitle: { fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 10 },
  tipsList: { paddingLeft: 16 },
  tip: { fontSize: 12, color: '#78350f', marginBottom: 6, lineHeight: 1.5 },
};
