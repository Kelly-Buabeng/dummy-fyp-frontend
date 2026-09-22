# RoadGuard AI — Frontend

A React + TypeScript frontend for the [FYP-26 Pothole Detection API](https://github.com/Kelly-Buabeng/FYP-26-POTHOLE-DETECTION) — a YOLOv8-powered road hazard detector deployed on Railway. Built with Vite, React Router, Tailwind CSS v4, and [shadcn/ui](https://ui.shadcn.com).

Design direction is modeled on [apple.com/apple-intelligence](https://www.apple.com/apple-intelligence/): a white canvas, near-black text, the blue → purple → pink Apple Intelligence gradient used only as an accent glow and gradient-clipped headline text, solid black pill buttons, flat light-gray surfaces, and alternating full-black sections for dramatic feature breaks.

## Stack

- **Vite + React 19 + TypeScript** — client-only SPA, no SSR
- **React Router v7** — `/`, `/live-demo`, `/heatmap`, `/dashboard`, `/about`, and a catch-all 404 route
- **Tailwind CSS v4** (`@tailwindcss/vite`) + **shadcn/ui** — the `src/components/ui/*` primitives are sourced directly from shadcn's public GitHub registry rather than generated with their CLI (see below), then themed via `src/globals.css` to match the design above
- **react-leaflet** + **leaflet.heat** for the heatmap page
- **react-chartjs-2** + **chart.js** for the dashboard's region/severity charts

### Why the shadcn components aren't CLI-generated

`npx shadcn add <component>` fetches from `ui.shadcn.com`'s live registry API, which wasn't
reachable from the sandbox this was built in (only the npm registry and
`raw.githubusercontent.com` were allowlisted there). Instead, each primitive's real source was
fetched directly from `shadcn-ui/ui` on GitHub (`apps/v4/registry/new-york-v4/ui/*.tsx`) — the
same files the CLI would have generated — with two deliberate adaptations on top:

1. `cn()` imports point at the local `src/lib/utils.ts` (the long-established `clsx` +
   `tailwind-merge` composition) instead of the newer `cn` micro-package upstream now uses.
2. The `Button` primitive's `rounded-md` corners were changed to `rounded-full` throughout, for
   RoadGuard AI's pill-button brand — the one deliberate visual customization on top of an
   otherwise-unmodified upstream component.

If you have full network access, `npx shadcn@latest add <component>` should still work against
this project going forward — nothing about the setup here is non-standard, it's just how these
particular files got here.

## Running locally

```bash
npm install
npm run dev
# open http://localhost:5173
```

```bash
npm run build      # tsc -b && vite build -> dist/
npm run preview    # serve the production build locally
```

## Pages

| Route | Purpose | Endpoints used |
|---|---|---|
| `/` | Landing page, live stat preview | `GET /api/v1/stats` |
| `/live-demo` | Upload a photo + GPS, run detection, see bounding boxes | `POST /api/v1/detect` |
| `/heatmap` | Leaflet heatmap of confirmed potholes | `GET /api/v1/heatmap` |
| `/dashboard` | Stats, region/severity report, CSV/GeoJSON export, delete tool | `GET /api/v1/stats`, `GET /api/v1/report`, `GET /api/v1/detections/export`, `DELETE /api/v1/detections/{id}` |
| `/about` | Project story and architecture | — |
| `*` | Custom not-found page | — |

## Configuration

The API base URL is set once, in `src/lib/api.ts`:

```ts
export const API_BASE = "https://web-production-0431d.up.railway.app";
```

Update this if the backend moves.

`/api/v1/detect`, `/api/v1/detections/export`, and `DELETE /api/v1/detections/{id}` are
protected by an `X-API-Key` header. This frontend has no server side of its own to hide a
secret in, so the Live Demo and Dashboard pages ask the visitor to paste in their own key —
it's kept in `localStorage` only if they check "remember," and is never sent anywhere but
the RoadGuard API.

### Backend CORS

Once this frontend is deployed, add its exact origin (and `http://localhost:5173` for local
dev) to the backend's `CORS_ORIGINS` environment variable on Railway (comma-separated), e.g.:

```
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.example
```

Without this, the browser will block requests from the frontend even though the API itself is
reachable.

## Deployment

Any static host that can serve a Vite build works. Config is included for two:

- **Vercel** — `vercel.json` (rewrites unmatched paths to `index.html`)
- **Netlify** — `netlify.toml` (`[[redirects]]` — unmatched paths fall through to `index.html`;
  deliberately no `force = true`, so real files under `/assets/*` still serve directly rather
  than being swallowed into the SPA fallback)

Known tradeoff of the SPA fallback: every unmatched route now returns HTTP 200 (the app renders
its own 404 UI client-side) rather than a real 404 status, and per-route `<title>`/meta tags
(via `useDocumentHead`) only update after JS runs — a regression from a static per-page HTML
file for crawlers/social-unfurlers that don't execute JS. If that matters later, the fix is
prerendering the two marketing routes (`/`, `/about`), not a client-side-only change.

## Structure

```
src/
  main.tsx              # app entry: BrowserRouter, global CSS/leaflet CSS imports
  App.tsx                # layout (Header/Footer) + routes, route-based code splitting
  globals.css             # Tailwind v4 theme tokens mapped from the design system
  lib/
    api.ts                 # RoadGuardApi client, ApiError, status-code-specific error copy
    types.ts                # mirrors the backend's Pydantic schemas
    utils.ts                 # cn() (clsx + tailwind-merge)
    chartSetup.ts             # explicit Chart.js element/scale registration
  hooks/
    useApiQuery.ts           # shared GET-fetch hook with AbortController cancellation
    useApiKey.ts              # localStorage-backed API key state
    useHealthStatus.ts         # footer's live /health ping
    useDocumentHead.ts          # per-route title/meta description
  components/
    ui/                       # shadcn primitives (see above)
    layout/Header.tsx, Footer.tsx
    GlowField.tsx, StatTile.tsx, SeverityBar.tsx, TechPill.tsx, FeatureCard.tsx
    BoundingBoxCanvas.tsx      # canvas overlay for live-demo results
    HeatmapView.tsx             # react-leaflet + leaflet.heat bridge
    RegionChart.tsx, SeverityChart.tsx
  pages/
    Home.tsx, LiveDemo.tsx, Heatmap.tsx, Dashboard.tsx, About.tsx, NotFound.tsx
  types/
    leaflet-heat.d.ts         # ambient types for leaflet.heat (ships none upstream)
public/
  assets/img/                # favicons, apple touch icon, social preview image
  robots.txt
```
