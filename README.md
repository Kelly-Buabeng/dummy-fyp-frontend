# RoadGuard AI — Frontend

A static, dependency-free frontend for the [FYP-26 Pothole Detection API](https://github.com/Kelly-Buabeng/FYP-26-POTHOLE-DETECTION) — a YOLOv8-powered road hazard detector deployed on Railway.

Design direction is inspired by [apple.com/apple-intelligence](https://www.apple.com/apple-intelligence/): a dark canvas, soft gradient light, large fluid type, and glass surfaces.

## Pages

| Page | Purpose | Endpoints used |
|---|---|---|
| `index.html` | Landing page, live stat preview | `GET /api/v1/stats` |
| `live-demo.html` | Upload a photo + GPS, run detection, see bounding boxes | `POST /api/v1/detect` |
| `heatmap.html` | Leaflet heatmap of confirmed potholes | `GET /api/v1/heatmap` |
| `dashboard.html` | Stats, region/severity report, CSV/GeoJSON export, delete tool | `GET /api/v1/stats`, `GET /api/v1/report`, `GET /api/v1/detections/export`, `DELETE /api/v1/detections/{id}` |
| `about.html` | Project story and architecture | — |
| `404.html` | Custom not-found page | — |

## Running locally

No build step or dependencies — it's plain HTML/CSS/JS.

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Configuration

The API base URL is set once, in `assets/js/api.js`:

```js
const API_BASE = "https://web-production-0431d.up.railway.app";
```

Update this if the backend moves.

`/api/v1/detect`, `/api/v1/detections/export`, and `DELETE /api/v1/detections/{id}` are
protected by an `X-API-Key` header. This frontend has no server side of its own to hide a
secret in, so the Live Demo and Dashboard pages ask the visitor to paste in their own key —
it's kept in `localStorage` only if they check "remember," and is never sent anywhere but
the RoadGuard API.

### Backend CORS

Once this frontend is deployed, add its exact origin to the backend's `CORS_ORIGINS`
environment variable on Railway (comma-separated), e.g.:

```
CORS_ORIGINS=https://your-frontend-domain.example
```

Without this, the browser will block requests from the deployed frontend even though the
API itself is reachable.

## Deployment

Works on any static host. Config is included for two:

- **Vercel** — `vercel.json`
- **Netlify** — `netlify.toml` (routes unmatched paths to `404.html`)

For a host without native SPA/404 routing, point its "custom error page" or "not found"
setting at `404.html`.

## Structure

```
assets/
  css/style.css       design system: colors, layout, components
  js/api.js           API client (fetch wrapper, error handling)
  js/main.js           nav, header scroll, footer status pill, toasts
  js/live-demo.js      upload/preview/detect flow
  js/heatmap.js        Leaflet + heat layer
  js/dashboard.js      stats, charts, report table, export, delete
  img/                 favicons, apple touch icon, social preview image
index.html
live-demo.html
heatmap.html
dashboard.html
about.html
404.html
```
