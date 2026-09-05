"use client";
import Image from 'next/image';
import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import { LeafIcon, MountainIcon, HandsIcon, TeaIcon, CookingIcon, HikingIcon, BirdIcon, FireIcon, YogaIcon, PlaneIcon, SunIcon, CheckIcon } from '@/components/Icons';

const ICON_MAP = { tea: TeaIcon, cooking: CookingIcon, hiking: HikingIcon, bird: BirdIcon, fire: FireIcon, yoga: YogaIcon, plane: PlaneIcon, sun: SunIcon, mountain: MountainIcon };
const VALUE_ICONS = { sustainability: LeafIcon, community: HandsIcon, authenticity: CheckIcon };

export default function AboutClient({ sections, activities, guides, settings }) {
  const story = sections.story || {};
  const values = sections.values || {};

  return (
    <>
      {/* ═══ Hero ═══ */}
      <section className="hero" style={{ minHeight: '60vh' }}>
        <div className="hero__bg">
          <Image src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop" alt="Mountain landscape" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
        <div className="hero__overlay" />
        <div className="hero__content">
          <ScrollReveal>
            <p className="hero__label">Our Story</p>
            <h1 className="hero__title" style={{ fontSize: 'var(--text-5xl)' }}>{story.title || 'About Poudhyal Farms'}</h1>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider variant="mountains" />

      {/* ═══ Story ═══ */}
      <section className="section">
        <div className="container">
          <div className="grid-2 align-center">
            <ScrollReveal direction="left">
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                <Image src="https://images.unsplash.com/photo-1586348943529-beaae6c28db9?q=80&w=2070&auto=format&fit=crop" alt="Organic tea garden" width={600} height={450} style={{ width: '100%', height: 'auto' }} />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <p className="section-label">Since Three Generations</p>
              <h2 className="section-title">{story.title}</h2>
              {['para_1', 'para_2', 'para_3'].map((key, i) => (
                story[key] && <p key={i} className="mb-6" style={{ color: 'var(--color-text-light)', lineHeight: 1.8 }}>{story[key]}</p>
              ))}
            </ScrollReveal>
          </div>
        </div>
      </section>

      <SectionDivider variant="forest" />

      {/* ═══ Values ═══ */}
      <section className="section section--alt">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="section-label">Our Foundation</p>
              <h2 className="section-title">{values.title || 'Our Values'}</h2>
            </div>
          </ScrollReveal>
          <div className="grid-3">
            {['sustainability', 'community', 'authenticity'].map((key, i) => {
              const VIcon = VALUE_ICONS[key] || LeafIcon;
              return (
                <ScrollReveal key={key} delay={i * 0.15}>
                  <div className="card card--glow highlight-card">
                    <div className="highlight-card__icon"><VIcon size={28} /></div>
                    <h3>{values[`${key}_title`]}</h3>
                    <p>{values[`${key}_desc`]}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider variant="river" />

      {/* ═══ Activities ═══ */}
      <section className="section" id="activities">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="section-label">Experiences</p>
              <h2 className="section-title">Things to Do</h2>
              <p className="section-subtitle">From sunrise yoga to bonfire nights, every moment at Poudhyal Farms is crafted to connect you with nature.</p>
            </div>
          </ScrollReveal>
          <div className="grid-3">
            {activities.map((act, i) => {
              const IconComponent = ICON_MAP[act.iconName] || LeafIcon;
              return (
                <ScrollReveal key={act.id} delay={i * 0.1}>
                  <div className="card activity-card">
                    <div className="activity-card__icon"><IconComponent size={24} /></div>
                    <h3>{act.title}</h3>
                    <p>{act.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider variant="terraces" />

      {/* ═══ Travel Guide ═══ */}
      <section className="section section--alt">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="section-label">Plan Your Visit</p>
              <h2 className="section-title">Travel Guide</h2>
            </div>
          </ScrollReveal>
          <div className="grid-3">
            {guides.map((guide, i) => {
              const GIcon = ICON_MAP[guide.iconName] || MountainIcon;
              return (
                <ScrollReveal key={guide.id} delay={i * 0.15}>
                  <div className="guide-card">
                    <div className="guide-card__header">
                      <GIcon size={24} />
                      <h3>{guide.title}</h3>
                    </div>
                    <ul className="guide-list">
                      {guide.entries.map((entry, j) => (
                        <li key={j}><strong>{entry.label}:</strong> {entry.text}</li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider variant="forest" />

      {/* ═══ CTA ═══ */}
      <section className="cta-section">
        <ScrollReveal>
          <h2>Ready for an Adventure?</h2>
          <p>Book your stay and experience the magic of the Himalayan farmlands firsthand.</p>
          <div className="hero__actions">
            <Link href="/reservations#booking-form" className="btn btn--gold btn--lg">Book Now</Link>
            <Link href="/contact" className="btn btn--ghost btn--lg">Contact Us</Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
