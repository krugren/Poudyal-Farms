"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This route has been merged into the main dashboard.
// Redirect automatically so any old bookmarks still work.
export default function AdminEnquiriesRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/dashboard'); }, [router]);
  return null;
}
