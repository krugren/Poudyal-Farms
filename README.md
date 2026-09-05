# 🌿 Poudhyal Farms — Full-Stack Farmstay Website

> A production-ready, full-stack hospitality website built for a real organic farmstay in Gangtok, Sikkim. Built end-to-end: database schema, REST API, admin dashboard, booking system, and a premium animated frontend — all as a solo freelance project.

**Live client site** · [poudhyalfarms.com](https://poudhyalfarms.com) &nbsp;|&nbsp; **Airbnb listing** · [View Property](https://www.airbnb.co.in/rooms/1384121204022057341)

---

## ✨ What Was Built

A complete web platform replacing manual WhatsApp/phone bookings with a self-service system, featuring:

- **Guest-facing website** — animated homepage, photo gallery with lightbox, booking form, reviews, contact
- **Admin dashboard** — real-time reservation management, enquiry inbox, content editor, gallery uploader
- **REST API** — 20+ endpoints covering reservations, feedback, gallery, content, auth, and admin operations
- **Database + ORM** — Prisma ORM with SQLite (dev) / PostgreSQL-ready schema
- **SEO** — JSON-LD structured data (LodgingBusiness schema), sitemap, robots.txt, canonical URLs, Open Graph

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Language** | JavaScript (ES2024) |
| **Styling** | Vanilla CSS — custom design system, CSS variables, responsive grid |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) — scroll reveals, stagger, layout |
| **ORM** | [Prisma](https://www.prisma.io) — type-safe DB queries, migrations |
| **Database** | SQLite (dev) → PostgreSQL-ready (prod) |
| **Runtime** | Node.js via Next.js API Routes |
| **Auth** | JWT with HTTP-only cookies |
| **Fonts** | Google Fonts — Playfair Display + Manrope via `next/font` |
| **Images** | Next.js Image — automatic WebP/AVIF, `srcset`, lazy loading |
| **Real-time** | Server-Sent Events (SSE) for live admin notifications |
| **Security** | Rate limiting, CSP headers, HSTS, `X-Frame-Options: DENY` |
| **SEO** | JSON-LD `LodgingBusiness`, Open Graph, Twitter Cards, sitemap.xml |

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── page.js                    # Homepage (SSR)
│   ├── HomeClient.jsx             # Client: animations, gallery, reviews
│   ├── layout.js                  # Root layout: fonts, metadata, JSON-LD
│   ├── about/                     # About & Travel Guide
│   ├── reservations/              # Booking page with dual calendar
│   ├── contact/                   # Contact form
│   ├── feedback/                  # Guest review submission
│   ├── admin/                     # Protected admin dashboard (JWT)
│   │   ├── dashboard/             # Stats + real-time notifications
│   │   ├── reservations/          # Booking management + CSV export
│   │   ├── enquiries/             # Contact inbox
│   │   └── feedback/              # Review moderation + Google import
│   └── api/
│       ├── reservations/          # CRUD + availability checker
│       ├── enquiries/             # Contact form handler
│       ├── feedback/              # Reviews + SSE stream
│       ├── gallery/               # Image management
│       ├── content/               # CMS-style content API
│       ├── auth/                  # Login / verify
│       └── admin/                 # Admin operations + export
├── components/
│   ├── Navbar.jsx                 # Scroll-aware, animated mobile drawer
│   ├── GallerySection.jsx         # Filterable gallery + lightbox
│   ├── BookingWidget.jsx          # Date picker + guest selector
│   ├── AmenitiesSection.jsx       # Amenity cards from DB
│   ├── FloatingActions.jsx        # WhatsApp FAB + scroll-to-top
│   ├── StarRating.jsx             # Animated star rating widget
│   ├── Tilt3D.jsx                 # CSS 3D tilt (gyroscope on mobile)
│   ├── ScrollReveal.jsx           # IntersectionObserver scroll animations
│   ├── LoadingScreen.jsx          # Branded intro loader (session-gated)
│   ├── MistDewCursor.jsx          # Canvas cursor with trail effect
│   ├── SectionDivider.jsx         # SVG mountain/forest/river dividers
│   └── FooterSilhouette.jsx       # Animated Fourier wave footer art
├── lib/
│   ├── prisma.js                  # Prisma singleton
│   └── auth.js                    # JWT helpers
└── hooks/
    └── useSSE.js                  # SSE hook for real-time updates
```

---

## 📸 Features Deep-Dive

### 🗓 Booking System
- Dual date-range calendar with blocked/available date fetching
- Guest picker (adults / children / infants) with validation
- Real-time availability check via `/api/reservations/available`
- Status flow: `pending → confirmed → cancelled`
- Admin approve/reject with one click; CSV export for records

### 🖼 Photo Gallery
- 14 real property photos from the Airbnb listing
- Category filter tabs (Farm / Rooms / Activities / Landscape)
- Masonry grid layout with CSS `columns`
- Full-screen lightbox with keyboard navigation (← → Esc)
- Next.js `<Image fill>` — automatic WebP/AVIF conversion
- `aria-live` region for screen reader accessibility

### 🔐 Admin Dashboard
- JWT auth with `httpOnly + Secure + SameSite=Strict` cookies
- Real-time booking alerts via Server-Sent Events
- Google review import — scrape and seed verified guest reviews
- Inline content editor — no redeploy needed for text/stat changes
- Gallery manager — upload, tag by category, show/hide toggle

### 📈 SEO & Performance
- `LodgingBusiness` JSON-LD (Google rich results: stars, address, price)
- `sitemap.xml` and `robots.txt` via Next.js route handlers
- Canonical URL, Open Graph, Twitter Card metadata
- Hero image: 302 KB raw → **122 KB** via Next.js optimizer
- Removed Three.js particle library → saved **1.5 MB** from bundle
- Immutable `Cache-Control` for all uploaded images

### 🎨 Animated UI Details
- Framer Motion stagger on hero text (blur + y-axis entry)
- `ScrollReveal` — IntersectionObserver with directional slide-in
- 3D card tilt using pointer position (gyroscope on mobile)
- Animated stats counters (count up on scroll into view)
- SVG mountain/forest/river scene dividers between sections
- Custom canvas cursor with mist/dew trail effect
- Glassmorphism navbar: transparent → solid on scroll

---

## 🗃 Database Schema (Prisma)

```prisma
model Reservation {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  phone     String
  checkIn   DateTime @map("check_in")
  checkOut  DateTime @map("check_out")
  guests    Int
  adults    Int      @default(1)
  children  Int      @default(0)
  status    String   @default("pending")  // pending | confirmed | cancelled
  message   String?
  createdAt DateTime @default(now())
  @@map("reservations")
}

model GalleryImage {
  id        Int     @id @default(autoincrement())
  url       String
  altText   String  @map("alt_text")
  category  String  @default("general")
  sortOrder Int     @default(0) @map("sort_order")
  isActive  Boolean @default(true) @map("is_active")
  @@map("gallery")
}

// + Enquiry, Feedback, Admin, SiteContent, Activity, RoomType, TravelGuide, SiteSettings
```

---

## 🔒 Security

| Concern | Solution |
|---|---|
| Authentication | JWT with `httpOnly + Secure + SameSite=Strict` cookies |
| Brute force | Sliding-window rate limiter on all public POST routes |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Clickjacking | `X-Frame-Options: DENY` |
| HTTPS | `Strict-Transport-Security: max-age=31536000` |
| Admin API | Server-side JWT verification on every request |
| Secrets | `.env` and `dev.db` excluded from git (see `.env.example`) |

---

## 🚀 Running Locally

```bash
# 1. Clone and install
git clone https://github.com/krugren/Poudyal-Farms.git
cd Poudyal-Farms
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env — set DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD

# 3. Set up database
npx prisma migrate dev
npx prisma db seed

# 4. Start dev server
npm run dev
# → http://localhost:3000
# → Admin: http://localhost:3000/admin
```

---

## 📦 Key Dependencies

```json
{
  "next": "^16.2.9",
  "react": "^19.0.0",
  "framer-motion": "^12.x",
  "@prisma/client": "^7.x",
  "better-sqlite3": "^11.x",
  "jose": "^5.x"
}
```

---

## 🗺 Roadmap

- [ ] PostgreSQL migration (Neon/Supabase for production)
- [ ] Cloudflare R2 for gallery image storage
- [ ] Vercel deployment with preview PRs
- [ ] Email notifications (Resend) for booking confirmations
- [ ] Razorpay integration for deposit collection

---

## 👤 Author

**Kruththik** — Freelance Full-Stack Developer
> Built solo from design to deployment for a real hospitality client in Sikkim, India.

---

*Next.js · Prisma · Framer Motion · Vanilla CSS · SQLite*