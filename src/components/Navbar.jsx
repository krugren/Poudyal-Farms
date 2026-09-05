"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoIcon } from './Icons';

const NAV_LINKS = [
  { path: '/',             label: 'Home' },
  { path: '/about',        label: 'About' },
  { path: '/#gallery',    label: 'Gallery' },
  { path: '/reservations', label: 'Reservations' },
  { path: '/feedback',     label: 'Feedback' },
  { path: '/contact',      label: 'Contact' },
];

// Framer Motion variants for the mobile drawer
const drawerVariants = {
  closed: { x: '100%', transition: { type: 'tween', duration: 0.32, ease: [0.32, 0, 0.67, 0] } },
  open:   { x: '0%',   transition: { type: 'tween', duration: 0.38, ease: [0.33, 1, 0.68, 1] } },
};

const linkVariants = {
  closed: { opacity: 0, x: 24 },
  open:   (i) => ({ opacity: 1, x: 0, transition: { delay: 0.08 + i * 0.06, duration: 0.32, ease: [0.33, 1, 0.68, 1] } }),
};

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const pathname                  = usePathname();
  const isHome                    = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isSolid = scrolled || !isHome || menuOpen;

  return (
    <>
      {/* ── Main navbar ── */}
      <motion.nav
        className="navbar"
        role="navigation"
        aria-label="Main navigation"
        animate={{
          backgroundColor: isSolid
            ? 'rgba(18, 40, 24, 0.97)'
            : 'rgba(0, 0, 0, 0)',
          backdropFilter: isSolid ? 'blur(14px)' : 'blur(0px)',
          borderBottomColor: isSolid
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(255,255,255,0)',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ borderBottomWidth: 1, borderBottomStyle: 'solid' }}
      >
        <div className="navbar__inner">
          {/* Logo */}
          <Link href="/" className="navbar__logo" aria-label="Poudhyal Farms - Home">
            <LogoIcon size={28} />
            <span>Poudhyal Farms</span>
          </Link>

          {/* Desktop links */}
          <div className="navbar__links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`navbar__link ${pathname === link.path ? 'navbar__link--active' : ''}`}
              >
                {link.label}
                {pathname === link.path && (
                  <motion.span
                    layoutId="nav-underline"
                    className="navbar__link-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            <div className="navbar__cta">
              <Link href="/reservations#booking-form" className="btn btn--primary btn--sm">
                Book Now
              </Link>
            </div>
          </div>

          {/* Hamburger */}
          <button
            className={`navbar__toggle ${menuOpen ? 'navbar__toggle--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="navbar__overlay navbar__overlay--visible"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 'min(320px, 85vw)',
                background: 'rgba(14, 32, 18, 0.98)',
                backdropFilter: 'blur(24px)',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                padding: '80px 32px 40px',
                borderLeft: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {NAV_LINKS.map((link, i) => (
                  <motion.div key={link.path} custom={i} variants={linkVariants} initial="closed" animate="open">
                    <Link
                      href={link.path}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '14px 0',
                        fontSize: '1.15rem',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 500,
                        color: pathname === link.path ? 'var(--color-gold)' : 'var(--color-cream)',
                        textDecoration: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34, duration: 0.32 }}
                style={{ marginTop: 'auto' }}
              >
                <Link
                  href="/reservations#booking-form"
                  className="btn btn--gold btn--lg"
                  onClick={() => setMenuOpen(false)}
                  style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                >
                  Book Your Stay
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
