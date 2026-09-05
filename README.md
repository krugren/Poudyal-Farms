# 🌿 Poudyal Farms — Full-Stack Farmstay Website

> A full-stack hospitality website developed as a freelance/client project for an organic farmstay in Gangtok, Sikkim. The project covers a complete frontend, backend API, admin dashboard, booking workflow, review management, and SEO foundations. **The project was not deployed to production after the client decided not to proceed.**

**Project status:** Functional prototype — client project, not live  
**Development approach:** Independently directed using an AI-assisted workflow (planning, architecture, and iteration with ChatGPT and Claude models)

---

## 🎯 What This Demonstrates

This isn't a tutorial project or a clone. It was built for a real client with real requirements:

- Designed the data model from scratch for a hospitality business context
- Made architectural decisions (SSR vs client rendering, JWT vs session, SSE vs WebSockets)
- Built a full admin system a non-technical client could actually use
- Iterated on UX and performance based on real feedback
- Managed the full scope solo — from DB schema to CSS animations

---

## ✨ What Was Built

A complete web platform designed to replace manual WhatsApp/phone bookings:

- **Guest-facing website** — animated homepage, photo gallery with lightbox, booking form, reviews, contact
- **Admin dashboard** — reservation management, enquiry inbox, content editor, gallery uploader
- **REST API** — 20+ endpoints: reservations, feedback, gallery, content, auth, admin operations
- **Database + ORM** — Prisma with SQLite (dev); schema is PostgreSQL-compatible for production
- **SEO foundations** — JSON-LD structured data, sitemap.xml, robots.txt, canonical URLs, Open Graph

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Language** | JavaScript (ES2024) |
| **Styling** | Vanilla CSS — custom design system, CSS variables, responsive grid |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) — scroll reveals, stagger, layout |
| **ORM** | [Prisma](https://www.prisma.io) — type-safe queries, migrations |
| **Database** | SQLite (dev) → PostgreSQL-ready schema |
| **Auth** | JWT with `httpOnly + Secure + SameSite=Strict` cookies |
| **Fonts** | Google Fonts — Playfair Display + Manrope via `next/font` |
| **Images** | Next.js `<Image>` — automatic WebP/AVIF, `srcset`, lazy loading |
| **Real-time** | Server-Sent Events (SSE) for live admin notifications |
| **Security** | Rate limiting middleware, CSP headers, HSTS, `X-Frame-Options: DENY` |
| **SEO** | JSON-LD `LodgingBusiness` schema, Open Graph, Twitter Cards, sitemap.xml |

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── page.js                    # Homepage (SSR)
│   ├── HomeClient.jsx             # Client: animations, gallery, reviews
│   ├── layout.js                  # Root layout: fonts, metadata, JSON-LD
│   ├── about/                     # About & Travel Guide
│   ├── reservations/              # Booking page with dual calendar picker
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
│       ├── auth/                  # Login / session verify
│       └── admin/                 # Admin operations + CSV export
├── components/
│   ├── Navbar.jsx                 # Scroll-aware, animated mobile drawer
│   ├── GallerySection.jsx         # Filterable gallery with lightbox
│   ├── BookingWidget.jsx          # Date picker + guest selector
│   ├── AmenitiesSection.jsx       # Amenity cards from DB
│   ├── FloatingActions.jsx        # WhatsApp FAB + scroll-to-top
│   ├── Tilt3D.jsx                 # CSS 3D tilt (gyroscope on mobile)
│   ├── ScrollReveal.jsx           # IntersectionObserver scroll animations
│   ├── LoadingScreen.jsx          # Branded intro loader (session-gated)
│   ├── MistDewCursor.jsx          # Canvas cursor with trail effect
│   └── SectionDivider.jsx         # SVG mountain/forest/river dividers
├── lib/
│   ├── prisma.js                  # Prisma singleton
│   └── auth.js                    # JWT helpers
└── hooks/
    └── useSSE.js                  # SSE hook for real-time updates
```

---

## 📸 Features In Detail

### 🗓 Booking System
- Dual date-range calendar with blocked/available date fetching from DB
- Guest picker (adults / children / infants) with validation
- Real-time availability check via `/api/reservations/available`
- Status flow: `pending → confirmed → cancelled`
- Admin approve/reject with one click; CSV export for records

### 🖼 Photo Gallery
- 14 real property photos from the client's Airbnb listing
- Category filter tabs (Farm / Rooms / Activities / Landscape)
- Masonry grid layout with CSS `columns`
- Full-screen lightbox with keyboard navigation (← → Esc)
- Next.js `<Image fill>` — automatic WebP/AVIF, lazy loading
- `aria-live` region for screen reader accessibility

### 🔐 Admin Dashboard
- JWT auth with `httpOnly + Secure + SameSite=Strict` cookies
- Real-time booking alerts via Server-Sent Events
- Google review import — fetch and seed verified guest reviews
- Inline content editor — no redeploy needed for text/stat changes
- Gallery manager — upload, tag by category, show/hide toggle

### 📈 SEO & Performance
- `LodgingBusiness` JSON-LD schema (Google rich results)
- `sitemap.xml` and `robots.txt` via Next.js route handlers
- Canonical URL, Open Graph, Twitter Card metadata
- Removed Three.js particles → saved **1.5 MB** from the JS bundle
- Next.js image optimizer: 302 KB raw JPEG → 122 KB served
- Immutable `Cache-Control` headers for all uploaded images

---

## 🗃 Database Schema

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
| HTTPS enforcement | `Strict-Transport-Security: max-age=31536000` |
| Admin API | Server-side JWT verification on every request |
| Secrets | `.env` and `dev.db` excluded from git (see `.env.example`) |

---

## 🚀 Running Locally

Everything works end-to-end on `npm run dev`:

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
# → http://localhost:3000        (guest site)
# → http://localhost:3000/admin  (admin dashboard)
```

---

## 🗺 What Isn't Implemented (and Why)

The following are architecturally planned and stubbed in `.env.example` but not active. They weren't set up because the client didn't proceed to production, so billing accounts were never opened.

| Feature | Service | Status |
|---|---|---|
| Production database | Neon / Supabase (PostgreSQL) | ⏳ Schema is PostgreSQL-compatible; swap `DATABASE_URL` to enable |
| Image object storage | Cloudflare R2 | ⏳ Env vars stubbed; `public/uploads/` used locally for now |
| Hosting + CI/CD | Vercel | ⏳ Would connect directly to this repo |
| Booking confirmation emails | Resend | ⏳ Not implemented |
| Deposit collection | Razorpay | ⏳ Not implemented |

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

## 👤 About This Project

Built solo as a freelance project for a real client in Sikkim, India.  
Developed using an AI-assisted workflow — I directed planning, architecture, and iteration using ChatGPT and Claude models. The design decisions, requirements analysis, and technical choices were mine; the AI accelerated implementation.

The client chose not to proceed to production, so the site was never deployed. The codebase represents a complete, functional prototype.

---

*Next.js · Prisma · Framer Motion · Vanilla CSS · SQLite*