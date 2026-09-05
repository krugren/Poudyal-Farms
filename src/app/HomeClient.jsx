"use client";
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import AnimatedCounter from '@/components/AnimatedCounter';
import StarRating from '@/components/StarRating';
import SectionDivider from '@/components/SectionDivider';
import Tilt3D from '@/components/Tilt3D';
import AmenitiesSection from '@/components/AmenitiesSection';
import GallerySection from '@/components/GallerySection';
import {
  LeafIcon, MountainIcon, HandsIcon, TeaIcon, CookingIcon,
  HikingIcon, BirdIcon, FireIcon, YogaIcon, SparkleIcon, QuoteIcon,
} from '@/components/Icons';


const ICON_MAP = {
  tea: TeaIcon, cooking: CookingIcon, hiking: HikingIcon,
  bird: BirdIcon, fire: FireIcon, yoga: YogaIcon,
};

// ── Hero text stagger animation ──────────────────────────────────────────────
const heroContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
};

const heroItemVariants = {
  hidden:  { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HomeClient({ sections, activities, settings, recentFeedback }) {
  const hero          = sections.hero         || {};
  const highlights    = sections.highlights   || {};
  const whyUs         = sections.why_us       || {};
  const cta           = sections.cta          || {};
  const testimonial   = sections.testimonial  || {};

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          HERO — staggered text with Framer Motion
         ═══════════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero__bg">
          <Image
            src="/uploads/gallery/pf-20260702-11.jpeg"
            alt="Poudhyal Farms A-frame farmhouse surrounded by lush Himalayan greenery"
            fill priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="hero__overlay" />
        <div className="hero__content" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p className="hero__label" variants={heroItemVariants}>
              {hero.tagline}
            </motion.p>
            {/* Optics: chromatic aberration on hover via CSS text-shadow */}
            <motion.h1 className="hero__title hero__title--chroma" variants={heroItemVariants}>
              {hero.title}
            </motion.h1>
            <motion.p className="hero__subtitle" variants={heroItemVariants}>
              {hero.subtitle}
            </motion.p>
            <motion.div className="hero__actions" variants={heroItemVariants}>
              <Link href="/reservations#booking-form" className="btn btn--gold btn--lg">
                Book Your Stay
              </Link>
              <Link href="/about" className="btn btn--ghost btn--lg">
                Explore the Farm
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Subtle scroll hint */}
        <motion.div
          className="hero__scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          aria-hidden="true"
        >
          <span />
        </motion.div>
      </section>

      <SectionDivider variant="mountains" />

      {/* ═══════════════════════════════════════════════════
          STATS BAR
         ═══════════════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div className="stats-bar">
            {[
              { target: settings.stats_guests || '150',      suffix: '+', label: 'Happy Guests' },
              { target: settings.stats_generations || '3',  suffix: '',  label: 'Generations' },
              { target: settings.stats_acres || '12',        suffix: '',  label: 'Acres of Farm' },
              { target: settings.stats_experiences || '6',   suffix: '',  label: 'Unique Experiences' },
            ].map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 0.08}>
                <div className="stats-bar__item">
                  <div className="stats-bar__number">
                    <AnimatedCounter target={s.target} suffix={s.suffix} />
                  </div>
                  <div className="stats-bar__label">{s.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider variant="forest" />

      {/* ═══════════════════════════════════════════════════
          HIGHLIGHTS — hover-lift cards
         ═══════════════════════════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="section-label"><SparkleIcon size={14} /> What Makes Us Special</p>
              <h2 className="section-title">Farm-Fresh Everything</h2>
            </div>
          </ScrollReveal>
          <div className="grid-3">
            {[
              { icon: <LeafIcon size={28} />,     title: highlights.organic_title,     desc: highlights.organic_desc },
              { icon: <MountainIcon size={28} />, title: highlights.views_title,       desc: highlights.views_desc },
              { icon: <HandsIcon size={28} />,    title: highlights.hospitality_title, desc: highlights.hospitality_desc },
            ].map((h, i) => (
              <ScrollReveal key={h.title || i} delay={i * 0.12}>
                {/* Linear Algebra + Optics: 3D rotation matrix tilt with specular glare */}
                <Tilt3D className="card card--glow highlight-card" style={{ height: '100%' }}>
                  <div className="highlight-card__icon">{h.icon}</div>
                  <h3>{h.title}</h3>
                  <p>{h.desc}</p>
                </Tilt3D>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider variant="river" />

      {/* ═══════════════════════════════════════════════════
          ACTIVITIES — staggered hover-lift cards
         ═══════════════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="section-label">Experiences</p>
              <h2 className="section-title">Things to Do at the Farm</h2>
              <p className="section-subtitle">
                Each experience is designed to immerse you in the natural beauty
                and cultural richness of Sikkim.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid-3">
            {activities.map((act, i) => {
              const IconComponent = ICON_MAP[act.iconName] || LeafIcon;
              return (
                <ScrollReveal key={act.id} delay={i * 0.08}>
                  {/* Linear Algebra: Tilt3D on activity cards too */}
                  <Tilt3D className="card activity-card" style={{ height: '100%' }}>
                    <div className="activity-card__icon"><IconComponent size={24} /></div>
                    <h3>{act.title}</h3>
                    <p>{act.description}</p>
                  </Tilt3D>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider variant="terraces" dark />

      {/* ═══════════════════════════════════════════════════
          WHY US — left/right slide-in
         ═══════════════════════════════════════════════════ */}
      <section className="section section--dark">
        <div className="container">
          <div className="grid-2 align-center">
            <ScrollReveal direction="left">
              <p className="section-label" style={{ color: 'var(--color-gold)' }}>Our Promise</p>
              <h2 className="section-title" style={{ color: 'var(--color-cream)' }}>{whyUs.title}</h2>
              <p className="section-subtitle" style={{ color: 'rgba(250,246,240,0.7)' }}>{whyUs.subtitle}</p>
            </ScrollReveal>
            <div>
              {[1, 2, 3].map(i => (
                <ScrollReveal key={i} delay={i * 0.13} direction="right">
                  <div className="why-card mb-8">
                    <div className="why-card__number">0{i}</div>
                    <div>
                      <h3 style={{ color: 'var(--color-cream)' }}>{whyUs[`point_${i}_title`]}</h3>
                      <p>{whyUs[`point_${i}_desc`]}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider variant="mountains" />

      {/* ═══════════════════════════════════════════════════
          TESTIMONIALS — review cards
         ═══════════════════════════════════════════════════ */}
      {recentFeedback?.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="section-label">Guest Voices</p>
                <h2 className="section-title">What Our Guests Say</h2>
              </div>
            </ScrollReveal>
            <div className="grid-3">
              {recentFeedback.map((fb, i) => (
                <ScrollReveal key={fb.id} delay={i * 0.1}>
                  <Tilt3D className="card review-card" style={{ height: '100%' }}>
                    <div className="review-header">
                      {fb.authorPhoto
                        ? <img src={fb.authorPhoto} alt={fb.name} className="review-avatar" style={{ objectFit: 'cover', padding: 0 }} />
                        : <div className="review-avatar" style={{ backgroundColor: fb.avatarColor }}>{fb.name.charAt(0)}</div>
                      }
                      <div style={{ flex: 1 }}>
                        <div className="review-author">{fb.name}</div>
                        <StarRating rating={fb.rating} size={14} />
                      </div>
                      {fb.source === 'google' && (
                        <span title="Verified Google Review" style={{ opacity: 0.65, flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className="review-comment">&ldquo;{fb.comment}&rdquo;</p>
                  </Tilt3D>
                </ScrollReveal>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/feedback" className="btn btn--outline">Read All Reviews</Link>
            </div>
          </div>
        </section>
      )}

      <SectionDivider variant="forest" />

      {/* ═══════════════════════════════════════════════════
          FEATURED QUOTE
         ═══════════════════════════════════════════════════ */}
      {testimonial.quote && (
        <section className="section">
          <div className="container container--narrow text-center">
            <ScrollReveal>
              <QuoteIcon
                size={40} className="text-muted mb-4"
                style={{ margin: '0 auto', display: 'block', color: 'var(--color-gold)', opacity: 0.3 }}
              />
              <blockquote style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-2xl)',
                lineHeight: 1.65,
                color: 'var(--color-text)',
                fontStyle: 'italic',
              }}>
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <p className="text-sm text-muted mt-4">— {testimonial.author}</p>
            </ScrollReveal>
          </div>
        </section>
      )}

      <SectionDivider variant="river" />

      {/* ═══════════════════════════════════════════════════
          AMENITIES — What this place offers
         ═══════════════════════════════════════════════════ */}
      <AmenitiesSection />

      <SectionDivider variant="forest" />

      {/* ═══════════════════════════════════════════════════
          GALLERY — Life at Poudhyal Farms
         ═══════════════════════════════════════════════════ */}
      <GallerySection />

      <SectionDivider variant="river" />

      {/* ═══════════════════════════════════════════════════
          CTA — Signal Processing (waves now live in FooterSilhouette)
         ═══════════════════════════════════════════════════ */}
      <section className="cta-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <ScrollReveal>
          <h2>{cta.title}</h2>
          <p>{cta.subtitle}</p>
          {/* Psychology — Von Restorff: single high-contrast primary CTA */}
          <div className="hero__actions">
            <Link href="/reservations#booking-form" className="btn btn--gold btn--lg">Reserve Now</Link>
            <Link href="/contact" className="btn btn--ghost btn--lg">Get in Touch</Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
