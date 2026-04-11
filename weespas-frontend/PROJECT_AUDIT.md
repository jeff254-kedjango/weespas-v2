# Weespas Frontend — Project Audit & Completion Plan

**Date:** 2026-04-11
**Target Audience:** Kenyan Gen Z & Millennials
**Inspiration:** Booking.com / Airbnb feel

---

## WHAT'S DONE (Frontend)

### Design System (90% Complete)
- **Color palette**: Midnight Emerald (`#022C22`), Soft Sand (`#F5F5F4`), Electric Lime (`#BFFF00`) — all defined in `variables.css`
- **Typography**: Plus Jakarta Sans (headings) + Nunito (body) loaded via Google Fonts
- **Spacing, shadows, border-radius, z-index**: Full token system in `variables.css`
- **Animations**: heartPop, fadeIn, slideUp, shimmer, pulse — all in `animations.css`
- **CSS reset & utilities**: Complete in `reset.css` and `utilities.css`

### Components (Built & Styled)
- **Navbar** — sticky, scroll-aware, mobile hamburger drawer with slide animation
- **Hero Section** — full viewport, background image, emerald gradient overlay, search bar, quick stats
- **Footer** — 3-column grid, social links, contact info, back-to-top
- **SearchPanel** — Sale/Rent toggle, lat/lng/radius inputs, property type, beds, baths, price range, geolocation button
- **PropertyGallery** — featured property carousel with prev/next navigation
- **PropertyList** — responsive grid with loading skeletons, error/empty states
- **PropertyCard** — image, title, distance, price (basic styling)
- **UI Components**: Badge, FavoriteButton (heart animation), ListingTypeBadge (Sale/Rent), PriceDisplay (glassmorphism), VerifiedBadge, VibeTag, SkeletonCard

### Data Layer (100% Complete)
- **API integration**: All endpoints wired (`fetchPropertyList`, `filterProperties`, `getNearby`, `getDetails`, `searchProperties`, `getFeatured`)
- **React Query**: Configured with 2min stale time, 15min GC, retry:1
- **Custom hooks**: `usePropertySearch` (infinite scroll), `useNearbySearch` (debounced geo), `usePropertyDetails`, `useFavorites` (localStorage), `useGeolocation`
- **TypeScript types**: Full type coverage for Property, Agent, Address, Images, Videos, Pagination
- **Utilities**: `formatPrice` (KES 5M, 25K/mo), `formatDate` (relative), `formatDistance` (m/km), `getVibeTags`

### Backend (100% Complete)
- FastAPI + SQLAlchemy with 6 models, 9 API endpoints
- Geo-spatial search (Haversine), advanced filtering, text search, pagination
- 100+ seeded Kenyan properties across Nairobi, Mombasa, Kisumu
- Agent management, property categories, soft deletes, view tracking

---

## WHAT'S NOT DONE

### Critical Missing Pieces

| # | Feature | Status | Impact |
|---|---------|--------|--------|
| 1 | **PropertyDetails page/modal** | Bare inline styles only — no proper layout, gallery, agent card, or contact | **HIGH** — users can't view full listings |
| 2 | **MobileBottomNav CSS** | Component exists, **zero styling** | **HIGH** — broken on mobile |
| 3 | **Map View** | Referenced everywhere (Hero, BottomNav) but **not built** | **HIGH** — core feature for proximity UX |
| 4 | **Authentication pages** | Login/Register routes in nav but **no pages exist** | **HIGH** — no user accounts |
| 5 | **Color scheme conflict** | `src/styles.css` has old red/blue palette conflicting with emerald/lime system | **MEDIUM** — visual inconsistency |

### Missing Features from UX Strategy

| # | Feature | From Strategy | Status |
|---|---------|---------------|--------|
| 6 | **"Stories" style photo carousel** | "Visual Storytelling" pillar | Not built — no image gallery/lightbox |
| 7 | **Video Tours / Reels** | Video integration recommendation | Type defined, **no UI** |
| 8 | **Map/List toggle** | "Map-First Toggle" recommendation | **Not built** |
| 9 | **Sorting UI controls** | API supports sort_by/sort_order | **No frontend controls** |
| 10 | **Text search bar** | API supports `/search/query` | **Not wired to UI** |
| 11 | **Favorites page** | Referenced in BottomNav | **Not built** |
| 12 | **User Profile page** | Referenced in BottomNav | **Not built** |
| 13 | **Advanced Search modal** | Button exists in SearchPanel | **No modal/page** |
| 14 | **Toast/notification system** | Needed for favorites, errors, actions | **Not built** |
| 15 | **"Quick View" interaction** | Hover/long-press on cards (Step 1 of strategy) | **Not built** |

---

## STEP-BY-STEP PLAN TO FINISH

### Phase 1: Fix What's Broken (1-2 days)

~~**Step 1** — Delete or merge `src/styles.css` (the old red/blue palette). Move any still-needed styles into the proper design system files. This eliminates the color conflict.~~ **DONE**

~~**Step 2** — Style `MobileBottomNav.tsx`. Create `MobileBottomNav.css` with: Fixed bottom bar, 4 equal tabs with icons + labels, Active state indicator (Electric Lime underline), Favorites count badge, Safe area inset for notched phones.~~ **DONE**

~~**Step 3** — Build a proper `PropertyDetails` page/modal: Full-width image carousel with Stories progress dots, glassmorphic price overlay, property specs grid, distance/verified/vibe badges, agent contact card with Call/WhatsApp CTAs, location section with map placeholder, share + favorite buttons, slide-up on mobile + side panel on desktop.~~ **DONE**

### Phase 2: Core Features (3-5 days)

**Step 4** — Add **text search** to the Hero search bar. Wire it to the existing `/search/query` endpoint. Show results in the PropertyList below.

**Step 5** — Add **sorting controls** above the PropertyList (dropdown: "Nearest", "Price: Low-High", "Price: High-Low", "Newest"). Wire to the existing `sort_by`/`sort_order` params.

**Step 6** — Build the **Map/List toggle**:
- Use Leaflet.js (free, no API key) or Google Maps
- Map markers at each property's lat/lng
- Clicking marker shows mini PropertyCard popup
- Persistent toggle button visible at all times (per strategy)

**Step 7** — Build **image gallery/lightbox** for property details:
- Swipeable on mobile, arrow keys on desktop
- "Stories" progress bar across the top (per strategy)
- Lazy-loaded thumbnails

**Step 8** — Build **Favorites page** (`/favorites`):
- Read from `useFavorites` hook
- Reuse PropertyList grid layout
- Empty state: "No saved properties yet"

### Phase 3: Authentication & Profiles (3-4 days)

**Step 9** — Build **Login page** (`/login`):
- Phone number + OTP (Kenyan market preference) or email/password
- Social login buttons (Google, Apple)
- "Sign up" link
- Add auth state management (Context or Zustand)

**Step 10** — Build **Register page** (`/register`):
- Name, phone, email, password
- Terms acceptance checkbox

**Step 11** — Build **User Profile page** (`/profile`):
- Avatar, name, contact info
- Saved properties count
- Search history (optional)
- Settings/preferences

**Step 12** — Add **backend auth endpoints** (currently missing from FastAPI backend):
- POST `/auth/register`, POST `/auth/login`, POST `/auth/verify-otp`
- JWT token management
- Protected endpoints for favorites sync

### Phase 4: Polish & Gen-Z Appeal (2-3 days)

**Step 13** — Add **Quick View** interaction:
- Desktop: hover on card shows expanded preview (price, specs, distance, mini gallery)
- Mobile: long-press triggers bottom sheet preview

**Step 14** — Add **Video Tour** placeholder in PropertyDetails:
- Play button overlay on thumbnail
- Video player modal (use HTML5 video, data already has `streaming_url`)

**Step 15** — Build **toast/notification system**:
- "Added to favorites", "Removed from favorites"
- "Location access granted", "Search results updated"
- Slide-in from bottom, auto-dismiss after 3s

**Step 16** — Add **Advanced Search modal**:
- Expand all filter options: parking, year built, engineer certified, size range
- "Apply Filters" with count badge showing matching results

**Step 17** — Performance & UX polish:
- Add `React.lazy()` + `Suspense` for route-level code splitting
- Add error boundaries per route
- Persist filters to URL params (shareable search links)
- Add page transition animations between routes
- SEO meta tags per page

### Phase 5: Production Readiness (1-2 days)

**Step 18** — Migrate backend from SQLite to PostgreSQL (config is already set up for it).

**Step 19** — Add image upload to backend (currently URL-only). Use Cloudinary or AWS S3 for CDN.

**Step 20** — Deploy:
- Frontend: Vercel or Netlify (Vite builds are supported natively)
- Backend: Railway, Render, or DigitalOcean (FastAPI + PostgreSQL)
- Set up CORS for production domain
- Environment variables for API URL

---

## Progress Summary

| Area | Progress |
|------|----------|
| Design System (CSS tokens) | **90%** — just kill the old `styles.css` |
| Component Library (UI pieces) | **75%** — missing MobileBottomNav CSS, Quick View, toast |
| Page/View Layer | **40%** — Hero + List done, Details/Map/Favorites/Auth missing |
| Data Layer (API + hooks) | **95%** — all endpoints wired, just needs search bar + sort UI |
| Backend | **90%** — missing auth endpoints |
| **Overall Frontend** | **~55% complete** |

---

## UX Strategy Reference

### The 5 Pillars (from UX Strategy doc)
1. **Hyper-Local Priority** — "Distance from you" badge on every card *(partially done)*
2. **"Vibe" over Specs** — Lifestyle tags like #WorkFromHomeReady *(VibeTag component built)*
3. **Thumb-First Navigation** — Bottom nav bar for mobile *(component exists, no CSS)*
4. **Visual Storytelling** — Large image cards with Stories-style progress bar *(not built)*
5. **Map-First Toggle** — Always-visible Map/List switch *(not built)*

### Brand Identity
- **Vibe:** Minimalist, sleek, "Aesthetic," and trustworthy
- **Primary:** Midnight Emerald `#022C22`
- **Background:** Soft Sand `#F5F5F4`
- **CTA:** Electric Lime `#BFFF00`
- **Fonts:** Plus Jakarta Sans (headers), Nunito (body)

### Key Recommendations Still Pending
- "Quick View" interaction (hover/long-press)
- Video Tours / Reels integration
- Glassmorphism overlay for price tags *(PriceDisplay component has this)*
- Heart icon animation for saving *(FavoriteButton has this)*
- Estate/Neighborhood in location text (e.g., "Kileleshwa, Nairobi")
