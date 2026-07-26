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
```

This is a **native-only** app (iOS & Android) — there is no web build.

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
  quick notes, livestock management (adjust quantity / remove), and an activity
  feed.
- **Calendar** — month grid with recurring, priority-aware maintenance tasks.
  Time-sensitive tasks schedule a local **notification** on their due date.
- **Graphs** — native SVG line charts per water parameter, **custom parameters**
  (premium), custom threshold lines, and real **CSV export** via the share sheet.
- **Gallery** — a photo timeline per tank with a full-screen viewer and editable
  captions; add from the **library or camera**. Images are stored on the
  filesystem (not the state blob) so albums scale safely.
- **Tools** — livestock database (add-your-own species), water-change &
  dosing calculators (unit-aware), and test timers that keep counting across
  navigation.
- **Community** — a tank showcase you can like (persisted) and post to.
- **Settings** — membership / paywall, **units toggle (°F/°C · gal/L)**,
  **notification controls** (on/off + reminder time), **edit tank** details,
  JSON **backup export & restore**, and delete-tank.

Tasks are **editable** (tap to edit) and time-sensitive ones reschedule their
reminder automatically.
- **Home-screen quick actions** — long-press the app icon to jump straight to
  Log / Tasks / Graphs / Gallery.

## Data & persistence

Tank data auto-saves to `AsyncStorage` on every change and reloads on launch,
so everything survives app restarts and works fully offline. Photos are written
to the app's document directory and referenced by URI, keeping the persisted
state small (and avoiding Android's AsyncStorage size limit). Full backups can
be exported to / restored from a JSON file.

## Native modules

`expo-file-system` (photo storage & file export), `expo-sharing`,
`expo-document-picker` (backup restore), `expo-notifications` (task reminders),
`expo-image-picker`, `expo-quick-actions`, `expo-linear-gradient`,
`react-native-svg`, `@react-native-community/slider`,
`@react-native-async-storage/async-storage`, `react-native-safe-area-context`,
and `lucide-react-native`.

## Theme

An abyssal / bioluminescent dark theme lives in `src/theme.ts` and the shared
`src/ui.tsx` kit. The app renders full-screen with safe-area insets for the
notch and home indicator.
