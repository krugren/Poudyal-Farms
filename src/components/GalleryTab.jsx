"use client";
import { useState, useEffect, useRef, useCallback } from 'react';

const CATEGORIES = ['general', 'farm', 'rooms', 'activities', 'landscape'];

function getToken() {
  try { return localStorage.getItem('poudhyal_admin_token') || ''; } catch { return ''; }
}

export default function GalleryTab() {
  const [images,    setImages]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter,    setFilter]    = useState('all');
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [dragOver,  setDragOver]  = useState(false);

  // Upload form state
  const [pendingFiles, setPendingFiles] = useState([]); // [{file, preview, altText, category}]
  const fileInputRef = useRef(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/api/gallery' : `/api/gallery?category=${filter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      // Admin sees all including inactive — fetch all
      const allRes  = await fetch('/api/gallery', { headers: { Authorization: `Bearer ${getToken()}` } });
      const allData = await allRes.json();
      setImages(allData.images || []);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  // Flash messages
  function flash(type, msg) {
    if (type === 'ok') { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); }
    else               { setError(msg);   setTimeout(() => setError(''),   4000); }
  }

  // ── File picking ──
  function addFiles(files) {
    const valid = [...files].filter(f => f.type.startsWith('image/'));
    const previews = valid.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      altText: f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      category: 'general',
    }));
    setPendingFiles(prev => [...prev, ...previews]);
  }

  function removePending(i) {
    setPendingFiles(prev => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, j) => j !== i);
    });
  }

  function updatePending(i, field, value) {
    setPendingFiles(prev => prev.map((p, j) => j === i ? { ...p, [field]: value } : p));
  }

  // ── Upload all pending ──
  async function uploadAll() {
    if (!pendingFiles.length) return;
    setUploading(true);
    setError('');
    let ok = 0, fail = 0;

    for (const item of pendingFiles) {
      const fd = new FormData();
      fd.append('file',     item.file);
      fd.append('altText',  item.altText);
      fd.append('category', item.category);
      try {
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: fd,
        });
        if (res.ok) ok++;
        else { const d = await res.json(); fail++; console.error(d.error); }
      } catch { fail++; }
    }

    pendingFiles.forEach(p => URL.revokeObjectURL(p.preview));
    setPendingFiles([]);
    setUploading(false);
    if (ok)   flash('ok',  `${ok} image${ok > 1 ? 's' : ''} uploaded successfully`);
    if (fail) flash('err', `${fail} upload${fail > 1 ? 's' : ''} failed`);
    fetchImages();
  }

  // ── Toggle visibility ──
  async function toggleVisibility(img) {
    try {
      await fetch(`/api/gallery/${img.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ isActive: !img.isActive }),
      });
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, isActive: !i.isActive } : i));
    } catch { flash('err', 'Failed to update visibility'); }
  }

  // ── Delete ──
  async function deleteImage(img) {
    if (!confirm(`Delete "${img.altText}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/gallery/${img.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setImages(prev => prev.filter(i => i.id !== img.id));
        flash('ok', 'Image deleted');
      } else flash('err', 'Delete failed');
    } catch { flash('err', 'Delete failed'); }
  }

  // ── Update alt text inline ──
  async function saveAlt(img, newAlt) {
    try {
      await fetch(`/api/gallery/${img.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ altText: newAlt }),
      });
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, altText: newAlt } : i));
    } catch { flash('err', 'Failed to save'); }
  }

  const filtered = filter === 'all' ? images : images.filter(i => i.category === filter);

  return (
    <div className="gallery-admin">

      {/* Flash messages */}
      {success && <div className="gallery-admin__flash gallery-admin__flash--ok">✓ {success}</div>}
      {error   && <div className="gallery-admin__flash gallery-admin__flash--err">✗ {error}</div>}

      {/* ── Upload zone ── */}
      <div
        className={`gallery-admin__dropzone ${dragOver ? 'gallery-admin__dropzone--over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload images"
        onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <p className="gallery-admin__dropzone-text">
          <strong>Drop images here</strong> or click to browse
        </p>
        <p className="gallery-admin__dropzone-hint">JPG, PNG, WebP, AVIF · Max 10 MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {/* ── Pending uploads preview ── */}
      {pendingFiles.length > 0 && (
        <div className="gallery-admin__pending">
          <div className="gallery-admin__pending-header">
            <span>{pendingFiles.length} image{pendingFiles.length > 1 ? 's' : ''} ready to upload</span>
            <button
              className="a-btn a-btn--primary a-btn--sm"
              onClick={uploadAll}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : `Upload ${pendingFiles.length > 1 ? 'All' : ''}`}
            </button>
          </div>
          <div className="gallery-admin__pending-grid">
            {pendingFiles.map((item, i) => (
              <div key={i} className="gallery-admin__pending-card">
                <div className="gallery-admin__pending-img-wrap">
                  <img src={item.preview} alt="" className="gallery-admin__pending-img" />
                  <button
                    className="gallery-admin__pending-remove"
                    onClick={() => removePending(i)}
                    aria-label="Remove"
                  >×</button>
                </div>
                <input
                  type="text"
                  className="gallery-admin__pending-input"
                  placeholder="Alt text / caption"
                  value={item.altText}
                  onChange={e => updatePending(i, 'altText', e.target.value)}
                />
                <select
                  className="gallery-admin__pending-select"
                  value={item.category}
                  onChange={e => updatePending(i, 'category', e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Existing images ── */}
      <div className="gallery-admin__library">
        <div className="gallery-admin__library-header">
          <h3>Image Library <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>({images.length})</span></h3>
          <div className="gallery-admin__library-filters">
            {['all', ...CATEGORIES].map(c => (
              <button
                key={c}
                className={`gallery-admin__filter-btn ${filter === c ? 'active' : ''}`}
                onClick={() => setFilter(c)}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="a-empty"><p>Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div className="a-empty">
            <span style={{ fontSize: 32 }}>🖼️</span>
            <p>No images yet. Upload some above.</p>
          </div>
        ) : (
          <div className="gallery-admin__grid">
            {filtered.map(img => (
              <GalleryAdminCard
                key={img.id}
                img={img}
                onToggle={() => toggleVisibility(img)}
                onDelete={() => deleteImage(img)}
                onSaveAlt={newAlt => saveAlt(img, newAlt)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function GalleryAdminCard({ img, onToggle, onDelete, onSaveAlt }) {
  const [alt, setAlt] = useState(img.altText);
  const [editing, setEditing] = useState(false);

  function handleSave() {
    setEditing(false);
    if (alt !== img.altText) onSaveAlt(alt);
  }

  return (
    <div className={`gallery-admin__card ${!img.isActive ? 'gallery-admin__card--hidden' : ''}`}>
      <div className="gallery-admin__card-img-wrap">
        <img src={img.url} alt={img.altText} className="gallery-admin__card-img" loading="lazy" />
        {!img.isActive && <div className="gallery-admin__card-badge">Hidden</div>}
        <span className="gallery-admin__card-cat">{img.category}</span>
      </div>

      {editing ? (
        <div className="gallery-admin__card-edit">
          <input
            autoFocus
            type="text"
            className="gallery-admin__pending-input"
            value={alt}
            onChange={e => setAlt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <button className="a-btn a-btn--primary a-btn--sm" onClick={handleSave}>Save</button>
        </div>
      ) : (
        <p
          className="gallery-admin__card-alt"
          onClick={() => setEditing(true)}
          title="Click to edit caption"
        >{img.altText}</p>
      )}

      <div className="gallery-admin__card-actions">
        <button
          className={`a-btn a-btn--sm ${img.isActive ? 'a-btn--outline' : 'a-btn--primary'}`}
          onClick={onToggle}
          title={img.isActive ? 'Hide from public gallery' : 'Show in public gallery'}
        >
          {img.isActive ? '👁 Visible' : '🙈 Hidden'}
        </button>
        <button className="a-btn a-btn--sm a-btn--danger" onClick={onDelete} title="Delete permanently">
          🗑 Delete
        </button>
      </div>
    </div>
  );
}
