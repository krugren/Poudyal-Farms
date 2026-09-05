"use client";

// ═══════════════════════════════════════════
// Poudhyal Farms — Premium SVG Icon Library
// All icons: monoline, currentColor, responsive
// ═══════════════════════════════════════════

const I = ({ children, size = 24, className = "", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{children}</svg>
);

export function LeafIcon({ size, className }) {
  return <I size={size} className={className}><path d="M11 20A7 7 0 0 1 4 13C4 6 12 2 12 2s8 4 8 11a7 7 0 0 1-7 7z" /><path d="M12 20V10" /><path d="M8 14c2-1 4-1 6 0" /></I>;
}

export function MountainIcon({ size, className }) {
  return <I size={size} className={className}><path d="m8 3 4 8 5-5 5 15H2L8 3z" /><path d="m5 15 3-3 2 2" /></I>;
}

export function HandsIcon({ size, className }) {
  return <I size={size} className={className}><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" /><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 13" /></I>;
}

export function TeaIcon({ size, className }) {
  return <I size={size} className={className}><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" x2="6" y1="2" y2="4" /><line x1="10" x2="10" y1="2" y2="4" /><line x1="14" x2="14" y1="2" y2="4" /></I>;
}

export function CookingIcon({ size, className }) {
  return <I size={size} className={className}><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" /><path d="M7 21h10" /><path d="M19.5 12 22 6" /><path d="M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62" /><path d="M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62" /></I>;
}

export function HikingIcon({ size, className }) {
  return <I size={size} className={className}><path d="m14 18-3-3 4.37-7.69" /><path d="M9.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" strokeWidth="0" fill="currentColor" /><path d="m13.5 5.5-4 6.5L6 19" /><path d="M7 16l-3 5" /><path d="m17 14 4 7" /></I>;
}

export function BirdIcon({ size, className }) {
  return <I size={size} className={className}><path d="M16 7h.01" /><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" /><path d="m20 7 2 .5-2 .5" /><path d="M10 18v3" /><path d="M14 17.75V21" /><path d="M7 18a6 6 0 0 0 3.84-10.61" /></I>;
}

export function FireIcon({ size, className }) {
  return <I size={size} className={className}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></I>;
}

export function YogaIcon({ size, className }) {
  return <I size={size} className={className}><circle cx="12" cy="4" r="2" /><path d="M12 6v4" /><path d="M6 12h12" /><path d="M12 10l-4 8" /><path d="M12 10l4 8" /><path d="M8 20h8" /></I>;
}

export function PlaneIcon({ size, className }) {
  return <I size={size} className={className}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></I>;
}

export function SunIcon({ size, className }) {
  return <I size={size} className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></I>;
}

export function PinIcon({ size, className }) {
  return <I size={size} className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></I>;
}

export function PhoneIcon({ size, className }) {
  return <I size={size} className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></I>;
}

export function MailIcon({ size, className }) {
  return <I size={size} className={className}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></I>;
}

export function StarIcon({ size = 16, className, filled = false }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function QuoteIcon({ size, className }) {
  return <I size={size} className={className}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z" /></I>;
}

export function ChevronDownIcon({ size, className }) {
  return <I size={size} className={className}><path d="m6 9 6 6 6-6" /></I>;
}

export function CalendarIcon({ size, className }) {
  return <I size={size} className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></I>;
}

export function UsersIcon({ size, className }) {
  return <I size={size} className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></I>;
}

export function DownloadIcon({ size, className }) {
  return <I size={size} className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></I>;
}

export function InstagramIcon({ size = 20, className }) {
  return <I size={size} className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></I>;
}

export function FacebookIcon({ size = 20, className }) {
  return <I size={size} className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></I>;
}

export function TwitterIcon({ size = 20, className }) {
  return <I size={size} className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></I>;
}

export function CheckIcon({ size, className }) {
  return <I size={size} className={className}><path d="M20 6 9 17l-5-5" /></I>;
}

export function ClockIcon({ size, className }) {
  return <I size={size} className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></I>;
}

export function SparkleIcon({ size, className }) {
  return <I size={size} className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></I>;
}

export function LogoIcon({ size = 32, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M24 4C24 4 8 14 8 28a16 16 0 0 0 32 0C40 14 24 4 24 4z" fill="url(#leaf-gradient)" opacity="0.15" />
      <path d="M24 6C24 6 10 15 10 27a14 14 0 0 0 28 0C38 15 24 6 24 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 40V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 28c3-2 6-2 9 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 22c4-3 8-3 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="leaf-gradient" x1="8" y1="4" x2="40" y2="44">
          <stop offset="0%" stopColor="#2d5a3f" />
          <stop offset="100%" stopColor="#d4a843" />
        </linearGradient>
      </defs>
    </svg>
  );
}
