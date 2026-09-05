"use client";
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import LoadingScreen from './LoadingScreen';
import SmoothScroll from './SmoothScroll';
import KeyboardShortcut from './KeyboardShortcut';
import MistDewCursor from './MistDewCursor';
import FloatingActions from './FloatingActions';

export default function ClientLayout({ children }) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('pf_visited')) {
      setShowLoader(true);
    }
  }, []);

  function handleLoaderComplete() {
    sessionStorage.setItem('pf_visited', '1');
    setShowLoader(false);
  }

  return (
    <>
      {/* ── Custom Cursor — rendered first, z-index: 999999 ── */}
      <MistDewCursor />

      {/* Lenis smooth scroll — global, no UI */}
      <SmoothScroll />

      {/* Secret admin keyboard shortcut */}
      <KeyboardShortcut />

      {showLoader && <LoadingScreen onComplete={handleLoaderComplete} />}

      {/* ── Skip to main content — keyboard/screen reader accessibility ── */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <FloatingActions />
    </>
  );
}
