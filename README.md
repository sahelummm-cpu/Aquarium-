# Reeflog 🐟

A bioluminescent **aquarium & reef tracker** — log water parameters, livestock,
maintenance tasks and photos for every tank. Built as an installable PWA.

## Why the Vercel deploy was 404-ing

The repository previously contained only a single `Reeflog.tsx` component with
no build setup — no `package.json`, `index.html`, or bundler config. Vercel had
nothing to build or serve, so every route returned `404: NOT_FOUND`.

This project now ships a full **Vite + React + TypeScript** app around that
component, which Vercel auto-detects and deploys.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run build      # production build -> dist/
npm run preview    # preview the production build
npm run icons      # regenerate PNG icons from public/icon.svg
```

## Deploying to Vercel

Vercel auto-detects the Vite framework (also pinned in `vercel.json`):

- **Build command:** `vite build`
- **Output directory:** `dist`
- **Install command:** `npm install`

Push to the connected branch (or run `vercel --prod`) and the 404 is resolved.

## Icons / logo

- `public/icon.svg` — the master vector logo (a glowing reef fish over a wave).
- PNG variants (`favicon-32`, `icon-192`, `icon-512`, `apple-touch-icon`,
  `icon-maskable-512`) are generated with `npm run icons` (uses `sharp`).
- Referenced from `index.html` (favicon / apple-touch-icon) and
  `public/manifest.webmanifest` (install icons).

## Widgets — home & lock screen

True OS widgets (iOS WidgetKit / Android App Widgets) require a **native** app
and can't be delivered from a website. The web-native equivalents shipped here:

1. **Installable PWA** (`manifest.webmanifest` + `sw.js`) — adds a real Reeflog
   icon to the phone home screen; opens standalone and works offline.
2. **Home-screen shortcuts** — long-pressing the installed icon exposes quick
   actions (Log a reading / Tasks / Gallery). These deep-link via `?tab=` and
   act like a mini widget menu.
3. **In-app glance widget** — the card at the top of the Home tab mirrors what a
   home / lock-screen widget would show: tank health, next due task, and the
   latest temperature and pH.

## Data & persistence

Reeflog persists through an async `window.storage` API. `src/main.tsx` provides
a `localStorage`-backed shim so data survives reloads and works offline.

## Theme

An abyssal / bioluminescent dark theme. Global shell styling (ambient backdrop,
safe-area insets for the notch & home indicator, custom scrollbars, desktop
phone-frame) lives in `src/index.css`; component styling is inline in
`src/Reeflog.tsx`.
