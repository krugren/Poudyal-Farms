"use client";
import { usePathname } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  // Admin pages have their own layout — no Navbar/Footer
  if (isAdmin) {
    return <>{children}</>;
  }

  return <ClientLayout>{children}</ClientLayout>;
}
