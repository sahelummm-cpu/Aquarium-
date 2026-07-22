import { Platform } from "react-native";

/* ============================================================
   REEFLOG theme — abyssal / bioluminescent palette.
   Shared across every native screen.
   ============================================================ */

export const T = {
  bg: "#061319",
  bg2: "#0b2029",
  card: "rgba(17,45,56,0.72)",
  cardSolid: "#112d38",
  line: "rgba(120,220,232,0.14)",
  cyan: "#3fe0d0",
  cyanDim: "#1f8f88",
  coral: "#ff7a6b",
  gold: "#ffd166",
  text: "#eafcff",
  sub: "#7fa9b3",
  danger: "#ff5c72",
  good: "#4ade80",
  ink: "#04222a", // text/icon color on top of the cyan gradient
};

/* The web build shipped Space Grotesk / DM Mono web fonts. On native we
   lean on the platform families so font-weight always renders correctly
   (custom fonts don't synthesize weights reliably across iOS/Android). */
export const FONT = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
}) as string;

export const MONO = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
}) as string;

/* Gradient colour stops reused around the app. */
export const CYAN_GRAD: [string, string] = [T.cyan, T.cyanDim];
