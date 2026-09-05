"use client";
import { useEffect, useRef } from 'react';

/**
 * Invisible component — no visible UI, no DOM hints about its purpose.
 *
 * Secret combo: hold Ctrl + Shift, press P, then F.
 * - e.preventDefault() on 'p' suppresses the Chrome print dialog.
 * - e.preventDefault() on 'f' suppresses the Chrome find-in-tab shortcut.
 * - window.location.href (full reload) guarantees the cookie is sent with
 *   the very first request to /admin, avoiding any race condition.
 */
export default function KeyboardShortcut() {
  const sequenceRef = useRef([]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!e.ctrlKey || !e.shiftKey) {
        sequenceRef.current = [];
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'p') {
        e.preventDefault(); // block Chrome print dialog
        sequenceRef.current = ['p'];
      } else if (key === 'f' && sequenceRef.current[0] === 'p') {
        e.preventDefault(); // block Chrome find shortcut
        sequenceRef.current = [];
        unlockAdmin();
      } else {
        sequenceRef.current = [];
      }
    };

    const unlockAdmin = () => {
      // Set the gate cookie (8-hour session)
      document.cookie = 'pf_admin_access=true; path=/; max-age=28800; SameSite=Strict';
      // Full-page navigation — cookie is committed before the request fires
      window.location.href = '/admin';
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return null;
}
