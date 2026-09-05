import './admin.css';

export const metadata = {
  title: 'Admin — Poudhyal Farms',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  // Admin pages render WITHOUT navbar/footer
  return <>{children}</>;
}
