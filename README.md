# Reeflog 🐟

A bioluminescent **aquarium & reef tracker** — log water parameters, livestock,
maintenance tasks and photos for every tank. Built as a **native mobile app**
with **React Native + Expo** (iOS & Android).

> Previously a Vite + React web PWA, Reeflog has been converted to a fully
> native React Native app. Every screen was ported from web DOM/CSS to native
> primitives (`View` / `Text` / `Pressable` / `TextInput` / `Image`), the SVG
> charts now render through `react-native-svg`, gradients through
> `expo-linear-gradient`, and data persists via `AsyncStorage`.

## Run it

```bash
npm install
npm start          # start the Expo dev server (press i / a, or scan the QR)
npm run ios        # open in an iOS simulator (macOS)
npm run android    # open on an Android emulator / device
npm run web        # run in the browser via react-native-web
```

Install the **Expo Go** app on your phone and scan the QR code from `npm start`
to run it on a real device instantly.

## Building installable binaries

Use [EAS Build](https://docs.expo.dev/build/introduction/) for store-ready apps:

```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

The app is configured for the New Architecture (`newArchEnabled`) and ships
bundle identifiers `com.reeflog.app`.

## Project structure

```
App.tsx                 # entry — SafeAreaProvider + StatusBar + <Reeflog/>
index.ts                # registerRootComponent
app.json                # Expo config (icons, splash, permissions, plugins)
assets/                 # app icon, adaptive icon, splash
src/
  theme.ts              # abyssal / bioluminescent palette + fonts
  storage.ts            # AsyncStorage-backed persistence (crash-safe auto-save)
  data.ts               # domain data, seed tank, livestock DB, health score
  ui.tsx                # shared native primitives (Card, Pill, Chip, Input, …)
  Reeflog.tsx           # root: state, tanks, tab routing, paywall
  components/           # Header (tank switcher), TabBar, Paywall
  screens/              # Home, Calendar, Graphs, Gallery, Tools, Community, Settings
```

## Features

- **Home** — glanceable widget, tank health score, due tasks, quick-log actions,
  quick notes and an activity feed.
- **Calendar** — month grid with recurring, priority-aware maintenance tasks.
- **Graphs** — native SVG line charts per water parameter, custom threshold
  lines, and CSV export.
- **Gallery** — a photo timeline per tank (via the device photo library).
- **Tools** — livestock database (add-your-own species), water-change &
  dosing calculators, and multiple test timers.
- **Community** — a tank showcase you can like and post to.
- **Settings** — membership / paywall, on-device data management, backup.

## Data & persistence

Tank data auto-saves to `AsyncStorage` on every change and reloads on launch,
so everything survives app restarts and works fully offline.

## Theme

An abyssal / bioluminescent dark theme lives in `src/theme.ts` and the shared
`src/ui.tsx` kit. The app renders full-screen with safe-area insets for the
notch and home indicator.
