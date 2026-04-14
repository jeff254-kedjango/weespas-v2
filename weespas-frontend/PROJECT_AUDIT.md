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

~~**Step 4** — Add **text search** to the Hero search bar. Wire it to the existing `/search/query` endpoint. Show results in the PropertyList below.~~ **DONE**

~~**Step 5** — Add **sorting controls** above the PropertyList (dropdown: "Nearest", "Price: Low-High", "Price: High-Low", "Newest"). Wire to the existing `sort_by`/`sort_order` params.~~ **DONE**

~~**Step 6** — Build the **Map/List toggle**: Use Leaflet.js (free, no API key) or Google Maps. Map markers at each property's lat/lng. Clicking marker shows mini PropertyCard popup. Persistent toggle button visible at all times (per strategy).~~ **DONE**

~~**Step 7** — Build **image gallery/lightbox** for property details: Swipeable on mobile, arrow keys on desktop. "Stories" progress bar across the top (per strategy). Lazy-loaded thumbnails.~~ **DONE**

~~**Step 8** — Build **Favorites page** (`/favorites`): Read from `useFavorites` hook. Reuse PropertyList grid layout. Empty state: "No saved properties yet".~~ **DONE**

### Phase 3: Authentication & Profiles (3-4 days)

~~**Step 9** — Build **Login page** (`/login`): Phone number + OTP (Kenyan market preference) or email/password, Social login buttons (Google, Apple), "Sign up" link, Auth state management (Context).~~ **DONE**

~~**Step 10** — Build **Register page** (`/register`): **DONE**~~

~~Prompt:~~

~~Role: Senior Frontend Engineer (React + TypeScript, modern UX best practices)~~
~~Task: Implement a Register page and fix global Navbar behavior inconsistencies across routes in a real-estate platform (Weespas).~~

~~🔧 Part 1 — Build Register Page (/register)~~

~~Create a fully responsive Register page with the following:~~

~~Input fields:~~
~~Full Name~~
~~Phone Number (Kenyan format validation preferred)~~
~~Email~~
~~Password~~
~~Terms & Conditions checkbox (required before submission)~~
~~Submit button (disabled until form is valid)~~
~~Basic validation:~~
~~Email format~~
~~Password minimum length~~
~~Required fields~~
~~Show inline error messages~~
~~Add loading state on submit~~
~~Clean, modern UI consistent with Weespas design (minimal, Airbnb-style)~~
~~🎯 Part 2 — Fix Navbar Visibility Across Pages~~

~~Problem:~~

~~On the homepage, the navbar is transparent over a hero section → works correctly~~
~~On other pages (no hero), the navbar remains transparent → becomes invisible on white background~~
~~✅ Implement a robust Navbar system with route-aware styling:~~
~~1. Add route-based detection~~
~~Use useLocation() from React Router~~
~~Detect if current route is homepage ("/")~~
~~2. Apply conditional styling logic~~
~~On homepage ("/"):~~
~~Navbar is transparent initially~~
~~On scroll → becomes solid white background~~
~~Logo switches from white → dark~~
~~On ALL other pages:~~
~~Navbar should ALWAYS be:~~
~~Solid white background~~
~~Dark logo~~
~~No transparency at any time~~
~~3. Combine scroll + route logic cleanly~~
~~Maintain scroll state (e.g., isScrolled)~~
~~Maintain route state (isHome)~~
~~Final logic:~~
~~If isHome && !isScrolled → transparent navbar~~
~~Otherwise → solid navbar~~
~~4. Ensure proper layering~~
~~Navbar should always be visible:~~
~~Use position: fixed~~
~~Add appropriate z-index~~
~~Avoid being hidden behind content~~
~~5. Improve UX polish~~
~~Add smooth transition:~~
~~background-color (fade)~~
~~logo color swap~~
~~Ensure readability:~~
~~Text/icons contrast correctly in both states~~
~~🎨 Output Requirements~~
~~Provide:~~
~~React component code (Register page)~~
~~Updated Navbar logic (with route + scroll handling)~~
~~Minimal CSS (or Tailwind if preferred)~~
~~Code should be clean, modular, and production-ready~~
~~Avoid duplication and keep logic centralized~~
~~💡 Goal~~

~~Create a seamless, premium UX where:~~
~~Navbar always remains visible and readable across all pages~~
~~Homepage retains its modern transparent hero aesthetic~~
~~Register page feels polished and trustworthy for Kenyan users~~

~~**Step 11** — Build **User Profile page** (`/profile`): **DONE**~~
~~- Avatar, name, contact info~~
~~- Saved properties count~~
~~- Search history (optional)~~
~~- Settings/preferences~~

~~**Step 12** — Add **backend auth endpoints** (currently missing from FastAPI backend):~~ **DONE**
~~- POST `/auth/register`, POST `/auth/login`, POST `/auth/verify-otp`~~
~~- JWT token management~~
~~- Protected endpoints for favorites sync~~

### Phase 4: Polish & Gen-Z Appeal (2-3 days)

**Step 13** — **Add Quick View interaction**:

- Desktop: hover on card shows expanded preview (price, specs, distance, mini gallery)

- Mobile: long-press triggers bottom sheet preview

**Step 13a** — Style and Optimize the Main Carousel:

- Layout: Ensure the carousel container occupies exactly 2/3 of the available width on desktop, maintaining balanced, aesthetically pleasing padding on both sides.

- Gen-Z & Millennial UX/UI: Apply a modern, clean, and highly engaging design language. Focus on sleek micro-interactions, smooth transitions, and a clutter-free look.

- Color Scheme Constraint: Do not invent or recommend a new color scheme. Strictly apply the project's existing color palette to all UI elements.

- Media & Navigation: Implement frictionless, intuitive navigation controls (e.g., modern arrows or swipe gestures). Ensure all property images are rendered crisply without any blurriness by utilizing proper image sizing, high-res source sets, and appropriate object-fit CSS properties.

~~**Step 13b** — **Build and Configure the Filter Card (SearchPanel.tsx)**:~~ **DONE**

~~- Layout: Position the filter card cleanly in the remaining 1/3 space on the right side of the screen (desktop view).~~

~~- Field Requirements: Implement the following interactive fields: "Use my location to search", "For rent", "For sale", "Radius", "Property Types" (populate dynamically using the property categories from our backend API), "Beds", "Baths", "Min-price", and "Max-price".~~

~~- Compound Filtering Logic: Configure the local state and event handlers so these filter fields can operate both independently (e.g., searching only by Property Type) or collectively for highly refined searches (e.g., Location + Radius + 2 Beds + 1 Bath + For Rent + Max Price). The component should compile these into a structured query object.~~

~~- Backend API Integration: Provide the necessary adjustments or boilerplate for the backend API so it is equipped to accept, parse, and accurately filter database results using this complex, multi-parameter input.~~

~~- Mobile View Tweaks: Refactor the mobile responsive view specifically for SearchPanel.tsx so that the "Beds" and "Baths" input fields sit side-by-side on the exact same line (e.g., using a flex row container) to maximize vertical screen real estate.~~


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
| Design System (CSS tokens) | **100%** — old `styles.css` removed, emerald/lime system active |
| Component Library (UI pieces) | **85%** — missing Quick View, toast |
| Page/View Layer | **80%** — Hero + List + Details + Map + Search + Sort + Gallery + Favorites + Login + Register + Profile done |
| Data Layer (API + hooks) | **100%** — all endpoints wired, search + sort connected |
| Backend | **100%** — auth endpoints added (register, login, OTP, JWT) |
| **Overall Frontend** | **~80% complete** |

---

## UX Strategy Reference

### The 5 Pillars (from UX Strategy doc)
1. **Hyper-Local Priority** — "Distance from you" badge on every card *(done)*
2. **"Vibe" over Specs** — Lifestyle tags like #WorkFromHomeReady *(VibeTag component built)*
3. **Thumb-First Navigation** — Bottom nav bar for mobile *(done — styled)*
4. **Visual Storytelling** — Large image cards with Stories-style progress bar *(next up — Step 7)*
5. **Map-First Toggle** — Always-visible Map/List switch *(done — Leaflet map built)*

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
