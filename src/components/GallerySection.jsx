"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

const CATEGORIES = [
  { id: 'all',        label: 'All' },
  { id: 'farm',       label: 'Farm' },
  { id: 'rooms',      label: 'Rooms' },
  { id: 'activities', label: 'Activities' },
  { id: 'landscape',  label: 'Landscape' },
];

/** Derive a short human-readable caption from the long alt text */
function shortCaption(altText = '') {
  // Take everything up to the first comma or after 'Poudhyal Farms' prefix
  return altText
    .replace(/^Poudhyal Farms\s*[—-]?\s*/i, '')
    .replace(/^(Bright|Modern|Comfortable|Cosy|Clean|Second|Indoor)\s/i, (m) => m)
    .split(/[,;]/)[0]
    .trim();
}

export default function GallerySection() {
  const [images,   setImages]   = useState([]);
  const [active,   setActive]   = useState('all');
  const [lightbox, setLightbox] = useState(null); // { url, altText, index }
  const [loading,  setLoading]  = useState(true);
  const liveRef = useRef(null);

  const fetchImages = useCallback(async (cat) => {
    setLoading(true);
    try {
      const url = cat === 'all' ? '/api/gallery' : `/api/gallery?category=${cat}`;
      const res = await fetch(url);
      const data = await res.json();
      setImages(data.images || []);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(active); }, [active, fetchImages]);

  // Announce filter result to screen readers
  useEffect(() => {
    if (!loading && liveRef.current) {
      liveRef.current.textContent = `Showing ${images.length} photos`;
    }
  }, [images.length, loading]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    function onKey(e) {
      if (e.key === 'Escape')      setLightbox(null);
      if (e.key === 'ArrowRight')  setLightbox(lb => lb && images[lb.index + 1] ? { ...images[lb.index + 1], index: lb.index + 1 } : lb);
      if (e.key === 'ArrowLeft')   setLightbox(lb => lb && images[lb.index - 1] ? { ...images[lb.index - 1], index: lb.index - 1 } : lb);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, images]);

  // Only show tabs that have images (or the currently active one)
  const visibleCats = CATEGORIES.filter(c =>
    c.id === 'all' || images.some(img => img.category === c.id) || active === c.id
  );

  return (
    <section className="gallery-section" id="gallery" aria-label="Photo Gallery">
      <div className="container">

        {/* Header */}
        <div className="gallery-section__header">
          <span className="section-eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            Gallery
          </span>
          <h2 className="section-title">Life at Poudhyal Farms</h2>
          <p className="section-subtitle">
            Glimpses of our farm, cottages, and the breathtaking Sikkimese landscape.
          </p>
        </div>

        {/* Screen-reader live region */}
        <span ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only" />

        {/* Category filter pills */}
        <div className="gallery-section__filters" role="tablist" aria-label="Filter gallery by category">
          {visibleCats.map(cat => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={active === cat.id}
              className={`gallery-filter-btn ${active === cat.id ? 'gallery-filter-btn--active' : ''}`}
              onClick={() => setActive(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="gallery-section__loading">
            <div className="gallery-skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="gallery-skeleton" style={{ '--delay': `${i * 0.08}s` }} />
              ))}
            </div>
          </div>
        ) : images.length === 0 ? (
          <div className="gallery-section__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            <p>Photos coming soon</p>
          </div>
        ) : (
          <div className="gallery-grid" role="list">
            {images.map((img, i) => (
              <button
                key={img.id}
                role="listitem"
                className="gallery-item"
                onClick={() => setLightbox({ ...img, index: i })}
                aria-label={`View photo: ${shortCaption(img.altText)}`}
                style={{ '--i': i }}
              >
                <div className="gallery-item__img-wrap">
                  <Image
                    src={img.url}
                    alt={img.altText}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="gallery-item__img"
                    loading={i < 4 ? 'eager' : 'lazy'}
                  />
                </div>
                <div className="gallery-item__overlay">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="M9 21H3v-6"/><path d="m3 21 7-7"/></svg>
                </div>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="gallery-lightbox"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={shortCaption(lightbox.altText)}
        >
          <button className="gallery-lightbox__close" aria-label="Close" onClick={() => setLightbox(null)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>

          {/* Prev / Next */}
          {lightbox.index > 0 && (
            <button
              className="gallery-lightbox__nav gallery-lightbox__nav--prev"
              aria-label="Previous image"
              onClick={e => { e.stopPropagation(); setLightbox({ ...images[lightbox.index - 1], index: lightbox.index - 1 }); }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          {lightbox.index < images.length - 1 && (
            <button
              className="gallery-lightbox__nav gallery-lightbox__nav--next"
              aria-label="Next image"
              onClick={e => { e.stopPropagation(); setLightbox({ ...images[lightbox.index + 1], index: lightbox.index + 1 }); }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          )}

          <div className="gallery-lightbox__img-wrap" onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Image
                src={lightbox.url}
                alt={lightbox.altText}
                fill
                sizes="100vw"
                className="gallery-lightbox__img"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <p className="gallery-lightbox__caption">{shortCaption(lightbox.altText)}</p>
            <span className="gallery-lightbox__counter">{lightbox.index + 1} / {images.length}</span>
          </div>
        </div>
      )}
    </section>
  );
}