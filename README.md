# Atronz Pet Social

A pet social, mating, adoption, marketplace and pet-services app for pet owners.

This is a **separate application** from **Atronz Pet Health** (`../atronz-pet-health`).
The two share the Atronz brand and a handful of UI conventions, but they are
independent projects with their own dependencies, navigation, data, build output
and Android package id — nothing here touches the Pet Health app.

| | Atronz Pet Health | Atronz Pet Social |
| --- | --- | --- |
| Directory | `../atronz-pet-health` | this one |
| Android `appId` | `com.atronz.pethealth` | `com.atronz.petsocial` |
| npm package | `atronz-pet-health-app` | `atronz-pet-social-app` |
| Dev server | `http://localhost:5173` | `http://localhost:5174` |
| Accent colour | sage green | clay / terracotta |

Both dev servers can run at the same time, and both APKs can be installed on the
same device.

## Stack

React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · React Router 6 (`HashRouter`) ·
lucide-react · Capacitor 6 (configured, not yet initialised).

## Getting started

```bash
npm install
npm run dev      # http://localhost:5174
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 5174 |
| `npm run build` | Typecheck (`tsc -b`) then production build to `dist/` |
| `npm run lint` | Typecheck only |
| `npm run preview` | Serve the built `dist/` |
| `npm run cap:sync` | Build, then sync into the Android project (once it exists) |

## Project layout

```
src/
  assets/brand/    Atronz lockup and mark (shared artwork)
  components/
    common/        ModulePlaceholder, SafetyNotice
    header/        SearchControl, NotificationButton, ProfileButton
    layout/        AppShell, Sidebar, MobileNavigation, TopHeader, PageHeading,
                   AppErrorBoundary
    ui/            Avatar, Badge, Button, Card, ConfirmDialog, EmptyState, Logo,
                   Modal, SectionHeader, Skeleton, ToastViewport
  config/          navigation.ts — the single source of truth for nav
  context/         AppDataContext (mock app state), ToastContext
  data/            mockData.ts — offline-safe placeholder data
  hooks/           useMediaQuery, useOnClickOutside
  lib/             api.ts (the data seam), utils.ts
  pages/           one file per route
  types/           domain types
```

## Routes

`HashRouter` is deliberate: Capacitor serves the built app from the filesystem,
where a history router breaks on reload and deep links.

| Route | Page | Status |
| --- | --- | --- |
| `/` | → `/feed` | redirect |
| `/feed` | Home | shell + module launcher; feed in Step 2 |
| `/discover` | Discover | placeholder; Step 3 |
| `/matches` | Matches | placeholder; Step 3 |
| `/adoption` | Adoption | placeholder; Step 4 |
| `/services` | Services | placeholder; Step 5 |
| `/marketplace` | Marketplace | placeholder; Step 6 |
| `/messages` | Messages | conversation list from mock data; threads in Step 7 |
| `/notifications` | Notifications | mock notifications, mark-as-read works |
| `/pets` | My Pets | mock pet list; editing in Step 8 |
| `/profile` | Profile | owner profile + privacy switches; persistence in Step 8 |
| `*` | Not found | — |

## Navigation

`src/config/navigation.ts` is the only place nav is defined. Ten destinations do
not fit a 320px bottom bar, so exactly five carry `inBottomBar` (Home, Discover,
Matches, Adoption, Messages). The rest are reachable from the desktop sidebar,
the mobile drawer, and the header (Notifications and Profile).

## Data

Everything comes from `src/lib/api.ts`, which returns mock objects after a short
delay. There is no network call anywhere in the app: no external APIs, no
analytics, no location services, no payments, no real accounts. Avatars fall
back to initials rather than fetching remote images, so the app renders
identically offline and inside the Android WebView.

Mutations (mark-as-read, privacy switches) are local to the session and are not
persisted.

## Safety posture

- Location is **city level only**. Precise location is never requested or stored.
- Vaccination, neutering and health details are **owner-declared and unverified**;
  every screen that surfaces them carries a `SafetyNotice`.
- Discovery is **opt-in** and off by default.
- Contact requests require **mutual consent** before anything is shared.
- The marketplace has **no payment path** and will not until one is explicitly
  built and reviewed.

## Android packaging

Capacitor is configured in `capacitor.config.ts` but not initialised — there is
no `android/` folder yet, by design. Packaging is a later step:

```bash
npx cap add android
npm run brand:native
npm run cap:sync
```

## Build status

Typecheck and production build both pass. Verified with no horizontal overflow
at 320px, 375px and 1280px on every route.
