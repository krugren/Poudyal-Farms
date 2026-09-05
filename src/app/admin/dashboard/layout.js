"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyToken } from '@/lib/admin-api';

// Lightweight auth guard — checks the JWT before rendering the dashboard.
// Uses the same token key as the login page (poudhyal_admin_token).
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    verifyToken()
      .then(() => setVerified(true))
      .catch(() => {
        localStorage.removeItem('poudhyal_admin_token');
        router.push('/admin');
      });
  }, [router]);

  if (!verified) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-forest-dark)' }}>
        <p style={{ color: 'var(--color-cream)', fontFamily: 'var(--font-body)' }}>Verifying session…</p>
      </div>
    );
  }

  return <>{children}</>;
}
