# 🌿 Poudyal Farms — Full-Stack Farmstay Website

> A full-stack hospitality website developed as a freelance project for an organic farmstay in Gangtok, Sikkim. Covers a complete frontend, admin dashboard, booking workflow, review management, real-time notifications, and SEO foundations.

**Live demo:** [poudyal-farms.vercel.app](https://poudyal-farms.vercel.app)
**Admin dashboard:** [poudyal-farms.vercel.app/admin](https://poudyal-farms.vercel.app/admin) *(read-only credentials available on request)*
**Development approach:** Independently directed using an AI-assisted workflow (ChatGPT / Gemini models for planning, architecture, and iteration)

---

## 🗂️ Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Vanilla CSS (custom design system) |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma 7 (driver adapter pattern) |
| Auth | JWT — httpOnly cookies |
| Real-time | Server-Sent Events (SSE) |
| Deployment | Vercel (CI/CD via GitHub) |
| Images | Served from public/ (Cloudflare R2 planned, not implemented) |

---

## ✅ What Was Built

A complete web platform designed to replace manual WhatsApp/phone bookings for a real hospitality client:

### Guest-facing site
- Animated homepage with farm intro, activities carousel, and testimonials
- Photo gallery with category filters and lightbox
- Room listings with pricing
- Booking / reservation form
- Google-style review display
- Travel guide with Sikkim hiking and sightseeing content
- Contact form

### Admin dashboard (/admin)
- Reservation inbox — view, status-update, and export bookings
- Enquiry inbox — read and manage contact form submissions
- Feedback moderation — approve/reject guest reviews
- Gallery manager — upload, reorder, toggle visibility of photos
- Site content editor — live-edit homepage text, hero taglines, settings
- Real-time notification bell (SSE) — alerts when new bookings/enquiries arrive

### Backend API (20+ endpoints)
- POST /api/reservations — create booking, emit SSE event
- GET/POST/PATCH /api/feedback — review submission and moderation
- GET/POST/DELETE /api/gallery — gallery CRUD
- GET/PUT /api/content/* — editable site copy
- POST /api/auth/login — JWT login with bcrypt
- GET /api/feedback/stream — SSE real-time stream

### Infrastructure
- Prisma schema with 10 tables: admin, reservations, enquiries, feedback, gallery, activities, room_types, site_content, site_settings, travel_guide
- Database migrations tracked in prisma/migrations/
- ISR (Incremental Static Regeneration) on public pages — 60s revalidation
- SEO: JSON-LD structured data, sitemap.xml, robots.txt, canonical URLs, Open Graph

---

## 🏗️ Architecture Decisions

| Decision | Choice | Why |
|---|---|---|
| Rendering | SSR + ISR | Content changes via admin; ISR gives speed without stale data |
| Auth | JWT in httpOnly cookie | Simple, stateless, no session store needed |
| Real-time | SSE not WebSockets | One-way push (server to admin); SSE is simpler and sufficient |
| ORM | Prisma with driver adapter | Serverless-compatible; works with Neon HTTP fetch mode |
| CSS | Vanilla CSS | Full control, zero runtime overhead |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.js              # Homepage (ISR)
│   ├── about/               # About page
│   ├── gallery/             # Photo gallery
│   ├── reservations/        # Booking form
│   ├── feedback/            # Guest reviews
│   ├── contact/             # Contact form
│   ├── admin/               # Protected dashboard
│   │   ├── reservations/
│   │   ├── feedback/
│   │   ├── gallery/
│   │   ├── enquiries/
│   │   └── content/
│   └── api/                 # REST API routes
├── components/              # Shared UI components
├── hooks/                   # useSSE, custom hooks
└── lib/
    ├── prisma.js            # Prisma client (Neon adapter)
    └── auth.js              # JWT helpers

prisma/
├── schema.prisma            # PostgreSQL schema (10 models)
├── migrations/              # Migration history
└── seed.js                  # Database seeder

public/
└── uploads/gallery/         # Farm photos (14 images)
```

---

## 🚀 Running Locally

```bash
git clone https://github.com/krugren/Poudyal-Farms
cd Poudyal-Farms

npm install

# Copy env template and fill in your Neon connection strings
cp .env.example .env

# Push schema to your DB and seed sample data
npx prisma migrate dev
node prisma/seed.js

npm run dev
```

See .env.example for all required environment variables.

---

## 🔧 Environment Variables

| Variable | Description |
|---|---|
| DATABASE_URL | Neon pooled connection string |
| DIRECT_URL | Neon direct connection (migrations only) |
| JWT_SECRET | Secret for signing JWT tokens |
| ADMIN_USERNAME | Admin login username |
| ADMIN_PASSWORD | Admin login password |
| NEXT_PUBLIC_SITE_URL | Canonical base URL |

---

## ⚠️ What Is Not Implemented

| Feature | Status | Notes |
|---|---|---|
| Cloudflare R2 image storage | Not implemented | Images served from public/ — R2 requires payment |
| Email notifications (Resend) | Not implemented | Requires payment |
| Payment gateway (Razorpay) | Not implemented | Client did not proceed to payment stage |
| Custom domain | Not configured | Client project ended before domain purchase |

---

## 📋 Context

This was a real client engagement for an organic farmstay in Gangtok, Sikkim. The majority of the platform was built and the system is fully functional. The client chose not to proceed to production, so the project was not launched under the client's domain.

The repository reflects the state of the project at that point — a working full-stack system, now deployed as a portfolio demonstration at [poudyal-farms.vercel.app](https://poudyal-farms.vercel.app).

---

*Built solo. Directed independently. AI-assisted workflow.*