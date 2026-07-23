import { T } from "./theme";

/* ============================================================
   Domain data + pure helpers.
   Ported verbatim from the original single-file web app.
   ============================================================ */

export const uid = () => Math.random().toString(36).slice(2, 10);
export const todayKey = () => new Date().toISOString().slice(0, 10);
export const daysBetween = (a: string, b: string) =>
  Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

export type ParamPreset = {
  id: string;
  name: string;
  unit: string;
  color: string;
  lo: number;
  hi: number;
  custom?: boolean;
};

/* Palette custom parameters cycle through for their chart colour. */
export const CUSTOM_PARAM_COLORS = ["#a78bfa", "#60a5fa", "#f472b6", "#fbbf24", "#34d399", "#fb7185"];

export const PARAM_PRESETS: ParamPreset[] = [
  { id: "ph", name: "pH", unit: "", color: T.cyan, lo: 6.5, hi: 8.4 },
  { id: "temp", name: "Temp", unit: "°F", color: T.coral, lo: 74, hi: 82 },
  { id: "ammonia", name: "Ammonia", unit: "ppm", color: T.gold, lo: 0, hi: 0.25 },
  { id: "nitrate", name: "Nitrate", unit: "ppm", color: "#a78bfa", lo: 0, hi: 40 },
  { id: "nitrite", name: "Nitrite", unit: "ppm", color: "#60a5fa", lo: 0, hi: 0.25 },
  { id: "chlorine", name: "Chlorine", unit: "ppm", color: "#f472b6", lo: 0, hi: 0 },
];

/* ---------- livestock database (add-your-own supported) ---------- */
export type Species = {
  id: string;
  name: string;
  sci: string;
  kind: "Fish" | "Invert" | "Coral" | "Plant";
  water: "Salt" | "Fresh";
  care: "Easy" | "Medium" | "Hard";
  temp: string;
  ph: string;
  min: number;
  note: string;
  custom?: boolean;
};

export const FISH_DB: Species[] = [
  { id: "clown", name: "Ocellaris Clownfish", sci: "Amphiprion ocellaris", kind: "Fish", water: "Salt", care: "Easy", temp: "74–80°F", ph: "8.0–8.4", min: 20, note: "Hardy and reef-safe, the clownfish forms a symbiotic bond with host anemones and is one of the best beginner saltwater fish. Pairs readily and defends a small territory." },
  { id: "oto", name: "Otocinclus Catfish", sci: "Otocinclus vestitus", kind: "Fish", water: "Fresh", care: "Medium", temp: "72–79°F", ph: "6.5–7.5", min: 10, note: "The algae-busting favorite of planted-tank hobbyists. This tireless, peaceful grazer keeps glass and leaves clean. Keep in groups of 6+ and only add to a mature, established tank." },
  { id: "betta", name: "Betta", sci: "Betta splendens", kind: "Fish", water: "Fresh", care: "Easy", temp: "76–82°F", ph: "6.5–7.5", min: 5, note: "The Siamese fighting fish. Keep males solo — they are territorial. Prefers warm, calm water and appreciates gentle filtration and floating plants." },
  { id: "neon", name: "Neon Tetra", sci: "Paracheirodon innesi", kind: "Fish", water: "Fresh", care: "Easy", temp: "70–81°F", ph: "6.0–7.0", min: 10, note: "A brilliant schooling fish that shows best color in groups of 6 or more. Peaceful and ideal for planted community tanks." },
  { id: "guppy", name: "Guppy", sci: "Poecilia reticulata", kind: "Fish", water: "Fresh", care: "Easy", temp: "72–82°F", ph: "6.8–7.8", min: 5, note: "Colorful, active livebearer that breeds readily. Great for beginners; keep more females than males to reduce stress." },
  { id: "angel", name: "Freshwater Angelfish", sci: "Pterophyllum scalare", kind: "Fish", water: "Fresh", care: "Medium", temp: "78–84°F", ph: "6.5–7.5", min: 30, note: "An elegant cichlid needing a tall tank. Can be territorial when breeding and may eat very small fish." },
  { id: "tang", name: "Blue Tang", sci: "Paracanthurus hepatus", kind: "Fish", water: "Salt", care: "Hard", temp: "72–78°F", ph: "8.1–8.4", min: 75, note: "Needs a large tank with open swimming space and strong flow. Prone to ich, so quarantine and stable parameters are essential." },
  { id: "goby", name: "Watchman Goby", sci: "Cryptocentrus cinctus", kind: "Fish", water: "Salt", care: "Easy", temp: "72–78°F", ph: "8.1–8.4", min: 20, note: "Reef-safe bottom dweller that famously pairs with a pistol shrimp, sharing a burrow. Hardy and full of personality." },
  { id: "pleco", name: "Bristlenose Pleco", sci: "Ancistrus cirrhosus", kind: "Fish", water: "Fresh", care: "Easy", temp: "73–81°F", ph: "6.5–7.5", min: 20, note: "A compact, hardy algae eater that stays smaller than common plecos. Needs driftwood to rasp on for digestion." },
  { id: "shrimp", name: "Cherry Shrimp", sci: "Neocaridina davidi", kind: "Invert", water: "Fresh", care: "Easy", temp: "68–78°F", ph: "6.5–8.0", min: 5, note: "A vivid red cleanup crew that breeds in stable colonies. Sensitive to copper and ammonia; best in a mature planted tank." },
  { id: "cleaner", name: "Cleaner Shrimp", sci: "Lysmata amboinensis", kind: "Invert", water: "Salt", care: "Easy", temp: "72–78°F", ph: "8.1–8.4", min: 20, note: "Reef-safe shrimp that sets up cleaning stations and picks parasites off fish. Needs stable salinity and slow acclimation." },
  { id: "nerite", name: "Nerite Snail", sci: "Neritina natalensis", kind: "Invert", water: "Fresh", care: "Easy", temp: "72–78°F", ph: "7.0–8.0", min: 5, note: "Arguably the best algae-eating snail. Won't overpopulate freshwater since eggs need brackish water to hatch." },
  { id: "trochus", name: "Trochus Snail", sci: "Trochus sp.", kind: "Invert", water: "Salt", care: "Easy", temp: "72–78°F", ph: "8.1–8.4", min: 10, note: "Reef cleanup-crew snail that grazes film and hair algae. Can right itself if flipped, unlike many other snails." },
  { id: "hammer", name: "Hammer Coral", sci: "Euphyllia ancora", kind: "Coral", water: "Salt", care: "Medium", temp: "76–82°F", ph: "8.1–8.4", min: 30, note: "A flowing LPS coral for moderate light and flow. Has sweeper tentacles — give it space from neighbors. Needs stable Ca, Alk and Mg." },
  { id: "zoa", name: "Zoanthids", sci: "Zoanthus sp.", kind: "Coral", water: "Salt", care: "Easy", temp: "76–82°F", ph: "8.1–8.4", min: 10, note: "Colorful beginner coral that spreads into colonies. Wear gloves — some carry palytoxin. Tolerant of a range of light and flow." },
  { id: "anubias", name: "Anubias", sci: "Anubias barteri", kind: "Plant", water: "Fresh", care: "Easy", temp: "72–82°F", ph: "6.0–7.5", min: 5, note: "A nearly indestructible low-light plant. Tie the rhizome to rock or wood — burying it causes rot. Slow-growing and algae-resistant." },
  { id: "java", name: "Java Fern", sci: "Leptochilus pteropus", kind: "Plant", water: "Fresh", care: "Easy", temp: "68–82°F", ph: "6.0–7.5", min: 5, note: "Extremely hardy epiphyte. Attach to hardscape rather than planting in substrate. Thrives in low light with no CO₂." },
  { id: "amazon", name: "Amazon Sword", sci: "Echinodorus grisebachii", kind: "Plant", water: "Fresh", care: "Easy", temp: "72–82°F", ph: "6.5–7.5", min: 20, note: "A large background plant that roots heavily — feed with root tabs. Becomes a dramatic centerpiece once established." },
  { id: "montecarlo", name: "Monte Carlo", sci: "Micranthemum tweediei", kind: "Plant", water: "Fresh", care: "Medium", temp: "70–78°F", ph: "6.0–7.5", min: 10, note: "A popular foreground carpet plant. Carpets fastest with good light and CO₂ but adapts to lower-tech setups more slowly." },
];

/* ---------- community showcase seed (gradient art, no external images) ---------- */
export type CommunityPost = {
  id: string;
  user: string;
  tank: string;
  grad?: [string, string];
  src?: string;
  likes: number;
  mine: boolean;
};

export const SEED_COMMUNITY: CommunityPost[] = [
  { id: uid(), user: "reefmark", tank: "Mixed Reef 90", grad: ["#0a3d4a", "#2fbf9f"], likes: 128, mine: false },
  { id: uid(), user: "aqualily", tank: "Iwagumi 20L", grad: ["#123d24", "#7bd389"], likes: 96, mine: false },
  { id: uid(), user: "bettaboss", tank: "Planted Betta", grad: ["#3a1f4a", "#c07bd3"], likes: 74, mine: false },
  { id: uid(), user: "nano_nate", tank: "Shrimp Nano", grad: ["#4a2f0a", "#d3b57b"], likes: 51, mine: false },
  { id: uid(), user: "coralcarla", tank: "SPS Frag Tank", grad: ["#0a2a4a", "#7bb5d3"], likes: 210, mine: false },
  { id: uid(), user: "mossgarden", tank: "Blackwater 40", grad: ["#2a1a0a", "#8f6a3f"], likes: 63, mine: false },
];

export type Livestock = { id: string; name: string; qty: number; kind: string };
export type Photo = { id: string; src: string; date: string; tag: string };
export type LogEntry = { id: string; date: string; type: string; note: string; photo: string | null };
export type Task = { id: string; title: string; every: number; next: string; priority: string; done: boolean; notifId?: string | null };
export type Threshold = { id: string; v: number; color: string };

export type Tank = {
  id: string;
  name: string;
  type: string;
  volume: number;
  started: string;
  livestock: Livestock[];
  photos: Photo[];
  measures: Record<string, { d: string; v: number }[]>;
  thresholds?: Record<string, Threshold[]>;
  logs: LogEntry[];
  tasks: Task[];
};

export function seedTank(): Tank {
  return {
    id: uid(),
    name: "Reef 40",
    type: "Saltwater",
    volume: 40,
    started: new Date(Date.now() - 400 * 86400000).toISOString().slice(0, 10),
    livestock: [
      { id: uid(), name: "Ocellaris Clownfish", qty: 2, kind: "Fish" },
      { id: uid(), name: "Cleaner Shrimp", qty: 1, kind: "Invert" },
      { id: uid(), name: "Trochus Snail", qty: 40, kind: "Invert" },
    ],
    photos: [],
    measures: PARAM_PRESETS.reduce((a, p) => {
      a[p.id] = [
        { d: todayKey(), v: p.id === "ph" ? 8.1 : p.id === "temp" ? 78 : p.id === "nitrate" ? 15 : 0 },
      ];
      return a;
    }, {} as Record<string, { d: string; v: number }[]>),
    logs: [],
    tasks: [
      { id: uid(), title: "Water change 25%", every: 7, next: todayKey(), priority: "normal", done: false },
      { id: uid(), title: "Test parameters", every: 3, next: todayKey(), priority: "timeSensitive", done: false },
    ],
  };
}

export function emptyTank(index: number): Tank {
  return { ...seedTank(), name: `Tank ${index}`, livestock: [], measures: {}, logs: [], tasks: [] };
}

/* Test timers are timestamp-based so they stay accurate across screen
   navigation (the countdown is derived from `endsAt`, not a tick counter). */
export type TimerItem = {
  id: string;
  label: string;
  sec: number;
  running: boolean;
  endsAt: number | null;
  leftWhenPaused: number;
};

export function defaultTimers(): TimerItem[] {
  return [{ id: uid(), label: "Nitrate test", sec: 300, running: false, endsAt: null, leftWhenPaused: 300 }];
}

export function healthScore(tank: Tank, params: ParamPreset[] = PARAM_PRESETS): { score: number; flags: string[] } {
  let score = 100;
  const flags: string[] = [];
  params.forEach((p) => {
    const arr = tank.measures?.[p.id];
    if (!arr?.length) return;
    const v = arr[arr.length - 1].v;
    if (p.hi != null && v > p.hi) { score -= 15; flags.push(`${p.name} high (${v}${p.unit})`); }
    if (p.lo != null && v < p.lo) { score -= 10; flags.push(`${p.name} low (${v}${p.unit})`); }
  });
  const lastLog = tank.logs[0]?.date;
  if (!lastLog || daysBetween(lastLog, todayKey()) > 10) {
    score -= 10;
    flags.push("No recent maintenance logged");
  }
  return { score: Math.max(0, Math.min(100, score)), flags };
}

/* gradient art per livestock kind (native two-stop gradients) */
export function gradFor(kind: string): [string, string] {
  switch (kind) {
    case "Fish": return ["#0a3d4a", "#2fbf9f"];
    case "Invert": return ["#4a2f0a", "#d3b57b"];
    case "Coral": return ["#3a1f4a", "#c07bd3"];
    case "Plant": return ["#123d24", "#7bd389"];
    default: return [T.cardSolid, T.cardSolid];
  }
}
