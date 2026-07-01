import React, { useState, useEffect, useRef } from "react";
import {
  Waves, Home, Calendar as CalIcon, BarChart3, Image as ImageIcon, Settings,
  Plus, Droplet, Fish, Thermometer, FlaskConical, Bell, BellRing, X, Check,
  Trash2, ChevronLeft, ChevronRight, Clock, Sparkles, Crown, Camera,
  Activity, TrendingUp, Leaf, Timer, Calculator, StickyNote, Heart,
  Search, BookOpen, Wrench, ArrowLeft, Beaker, Users, Cloud, Upload,
  Download, Share2, Minus, RotateCcw
} from "lucide-react";

/* ============================================================
   REEFLOG — Aquarium tracker
   Distinct abyssal / bioluminescent theme.
   All original Aquarium Log features + every bad-review fix.
   Data persists via window.storage (auto-save, crash-safe).
   ============================================================ */

const T = {
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
};

const FONT = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const MONO = "'DM Mono', ui-monospace, monospace";

const uid = () => Math.random().toString(36).slice(2, 10);
const todayKey = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.floor((new Date(b) - new Date(a)) / 86400000);

/* ---------- persistence (crash-safe auto-save) ---------- */
const KEY = "reeflog:v1";
async function loadState() {
  try {
    const r = await window.storage.get(KEY);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}
async function saveState(s) {
  try { await window.storage.set(KEY, JSON.stringify(s)); } catch {}
}

const PARAM_PRESETS = [
  { id: "ph", name: "pH", unit: "", color: T.cyan, lo: 6.5, hi: 8.4 },
  { id: "temp", name: "Temp", unit: "°F", color: T.coral, lo: 74, hi: 82 },
  { id: "ammonia", name: "Ammonia", unit: "ppm", color: T.gold, lo: 0, hi: 0.25 },
  { id: "nitrate", name: "Nitrate", unit: "ppm", color: "#a78bfa", lo: 0, hi: 40 },
  { id: "nitrite", name: "Nitrite", unit: "ppm", color: "#60a5fa", lo: 0, hi: 0.25 },
  { id: "chlorine", name: "Chlorine", unit: "ppm", color: "#f472b6", lo: 0, hi: 0 }, // review fix: chlorine present
];

/* ---------- livestock database (add-your-own supported) ---------- */
const FISH_DB = [
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
const SEED_COMMUNITY = [
  { id: uid(), user: "reefmark", tank: "Mixed Reef 90", grad: "linear-gradient(160deg,#0a3d4a,#1b6f7a,#2fbf9f)", likes: 128, mine: false },
  { id: uid(), user: "aqualily", tank: "Iwagumi 20L", grad: "linear-gradient(160deg,#123d24,#2e7d47,#7bd389)", likes: 96, mine: false },
  { id: uid(), user: "bettaboss", tank: "Planted Betta", grad: "linear-gradient(160deg,#3a1f4a,#7a3f8f,#c07bd3)", likes: 74, mine: false },
  { id: uid(), user: "nano_nate", tank: "Shrimp Nano", grad: "linear-gradient(160deg,#4a2f0a,#8f6a2f,#d3b57b)", likes: 51, mine: false },
  { id: uid(), user: "coralcarla", tank: "SPS Frag Tank", grad: "linear-gradient(160deg,#0a2a4a,#2f6a8f,#7bb5d3)", likes: 210, mine: false },
  { id: uid(), user: "mossgarden", tank: "Blackwater 40", grad: "linear-gradient(160deg,#2a1a0a,#5a3f1f,#8f6a3f)", likes: 63, mine: false },
];

function seedTank() {
  return {
    id: uid(),
    name: "Reef 40",
    type: "Saltwater",
    volume: 40,
    started: new Date(Date.now() - 400 * 86400000).toISOString().slice(0, 10),
    livestock: [
      { id: uid(), name: "Ocellaris Clownfish", qty: 2, kind: "Fish" },
      { id: uid(), name: "Cleaner Shrimp", qty: 1, kind: "Invert" },
      { id: uid(), name: "Trochus Snail", qty: 40, kind: "Invert" }, // review fix: qty-aware
    ],
    photos: [], // multi-photo album (review fix)
    measures: PARAM_PRESETS.reduce((a, p) => {
      a[p.id] = [
        { d: todayKey(), v: p.id === "ph" ? 8.1 : p.id === "temp" ? 78 : p.id === "nitrate" ? 15 : 0 },
      ];
      return a;
    }, {}),
    logs: [], // {id,date,type,note,photo}
    tasks: [
      { id: uid(), title: "Water change 25%", every: 7, next: todayKey(), priority: "normal", done: false },
      { id: uid(), title: "Test parameters", every: 3, next: todayKey(), priority: "timeSensitive", done: false },
    ],
  };
}

// Honor `?tab=` deep links so PWA home-screen shortcuts (Log / Tasks /
// Gallery) open straight to the right screen.
const VALID_TABS = ["home", "calendar", "graphs", "gallery", "tools", "community", "settings"];
function initialTab() {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && VALID_TABS.includes(t) ? t : "home";
  } catch { return "home"; }
}

export default function Reeflog() {
  const [tab, setTab] = useState(initialTab);
  const [tanks, setTanks] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [premium, setPremium] = useState(false);
  const [adsRemoved, setAdsRemoved] = useState(false);
  const [customFish, setCustomFish] = useState([]);
  const [community, setCommunity] = useState([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [ready, setReady] = useState(false);
  const first = useRef(true);

  /* load once */
  useEffect(() => {
    (async () => {
      const s = await loadState();
      if (s && s.tanks?.length) {
        setTanks(s.tanks); setActiveId(s.activeId || s.tanks[0].id);
        setPremium(!!s.premium); setAdsRemoved(!!s.adsRemoved);
        setCustomFish(s.customFish || []);
        setCommunity(s.community || SEED_COMMUNITY);
      } else {
        const t = seedTank(); setTanks([t]); setActiveId(t.id);
        setCommunity(SEED_COMMUNITY);
      }
      setReady(true);
    })();
  }, []);

  /* auto-save on every change (crash-safe) */
  useEffect(() => {
    if (!ready) return;
    if (first.current) { first.current = false; return; }
    saveState({ tanks, activeId, premium, adsRemoved, customFish, community });
  }, [tanks, activeId, premium, adsRemoved, customFish, community, ready]);

  const active = tanks.find((t) => t.id === activeId) || tanks[0];
  const updateTank = (id, patch) =>
    setTanks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const addTank = () => {
    if (!premium && tanks.length >= 2) { setShowPaywall(true); return; } // free: 2 tanks
    const t = { ...seedTank(), name: `Tank ${tanks.length + 1}`, livestock: [], measures: {}, logs: [], tasks: [] };
    setTanks((ts) => [...ts, t]); setActiveId(t.id); setTab("home");
  };

  if (!ready)
    return <Shell><div style={{ color: T.sub, padding: 40, textAlign: "center" }}>Loading your tanks…</div></Shell>;

  const showAds = !premium && !adsRemoved;

  return (
    <Shell>
      <FontInject />
      <Header active={active} tanks={tanks} setActiveId={setActiveId} addTank={addTank}
        premium={premium} onCrown={() => setShowPaywall(true)} onSettings={() => setTab("settings")}
        onGallery={() => setTab("gallery")} />

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 96px" }}>
        {tab === "home" && <HomeTab tank={active} updateTank={updateTank} showAds={showAds}
          onUpgrade={() => setShowPaywall(true)} premium={premium} setShowPaywall={setShowPaywall} />}
        {tab === "calendar" && <CalendarTab tank={active} updateTank={updateTank} premium={premium}
          onUpgrade={() => setShowPaywall(true)} />}
        {tab === "graphs" && <GraphsTab tank={active} updateTank={updateTank} />}
        {tab === "gallery" && <GalleryTab tank={active} updateTank={updateTank} premium={premium}
          onUpgrade={() => setShowPaywall(true)} />}
        {tab === "tools" && <ToolsTab tank={active} updateTank={updateTank} premium={premium}
          onUpgrade={() => setShowPaywall(true)} customFish={customFish} setCustomFish={setCustomFish} />}
        {tab === "community" && <CommunityTab tank={active} community={community}
          setCommunity={setCommunity} />}
        {tab === "settings" && <SettingsTab premium={premium} adsRemoved={adsRemoved}
          onUpgrade={() => setShowPaywall(true)} tanks={tanks} />}
      </div>

      <TabBar tab={tab} setTab={setTab} />
      {showPaywall && (
        <Paywall
          onClose={() => setShowPaywall(false)}
          onSubscribe={() => { setPremium(true); setAdsRemoved(true); setShowPaywall(false); }}
          onRemoveAds={() => { setAdsRemoved(true); setShowPaywall(false); }}
        />
      )}
    </Shell>
  );
}

/* ================= LAYOUT ================= */
function Shell({ children }) {
  return (
    <div style={{
      minHeight: "100vh", background: `radial-gradient(120% 80% at 50% -10%, ${T.bg2} 0%, ${T.bg} 55%)`,
      display: "flex", justifyContent: "center", fontFamily: FONT, color: T.text,
    }}>
      <div style={{
        width: "100%", maxWidth: 440, minHeight: "100vh", display: "flex", flexDirection: "column",
        position: "relative", background: `linear-gradient(180deg, ${T.bg} 0%, #05171d 100%)`,
      }}>{children}</div>
    </div>
  );
}

function FontInject() {
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(l);
    return () => { try { document.head.removeChild(l); } catch {} };
  }, []);
  return null;
}

function Header({ active, tanks, setActiveId, addTank, premium, onCrown, onSettings, onGallery }) {
  const age = active ? daysBetween(active.started, todayKey()) : 0;
  return (
    <div style={{ padding: "18px 16px 8px", position: "sticky", top: 0, zIndex: 5,
      background: `linear-gradient(180deg, ${T.bg} 70%, transparent)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: 11, display: "grid", placeItems: "center",
            background: `linear-gradient(135deg, ${T.cyan}, ${T.cyanDim})`, boxShadow: `0 0 18px ${T.cyan}55` }}>
            <Waves size={19} color="#04222a" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.5 }}>Reeflog</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          <button onClick={onGallery} style={iconBtn}><ImageIcon size={18} color={T.sub} /></button>
          <button onClick={onCrown} style={{ ...iconBtn, background: premium ? `${T.gold}22` : "transparent" }}>
            <Crown size={18} color={premium ? T.gold : T.sub} />
          </button>
          <button onClick={onSettings} style={iconBtn}><Settings size={18} color={T.sub} /></button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14, overflowX: "auto", paddingBottom: 4 }}>
        {tanks.map((t) => (
          <button key={t.id} onClick={() => setActiveId(t.id)}
            style={{
              flex: "0 0 auto", padding: "8px 14px", borderRadius: 13, border: `1px solid ${T.line}`,
              background: t.id === active?.id ? `linear-gradient(135deg, ${T.cyan}, ${T.cyanDim})` : T.card,
              color: t.id === active?.id ? "#04222a" : T.text, fontWeight: 600, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap",
            }}>
            <Fish size={14} /> {t.name}
          </button>
        ))}
        <button onClick={addTank} style={{ flex: "0 0 auto", padding: "8px 12px", borderRadius: 13,
          border: `1px dashed ${T.line}`, background: "transparent", color: T.cyan, cursor: "pointer" }}>
          <Plus size={16} />
        </button>
      </div>

      {active && (
        <div style={{ marginTop: 8, fontSize: 12, color: T.sub, fontFamily: MONO }}>
          {active.type} · {active.volume} gal · {age} days old
        </div>
      )}
    </div>
  );
}

/* ================= HOME ================= */
/* Glanceable widget — mirrors what a home / lock-screen widget shows.
   On installed PWAs this is the at-a-glance card users see first;
   its data (health, next task, latest params) is exactly what the
   OS widget / lock-screen complication would surface. */
function GlanceWidget({ tank }) {
  const health = healthScore(tank);
  const upcoming = [...tank.tasks].filter((t) => !t.done)
    .sort((a, b) => new Date(a.next) - new Date(b.next))[0];
  const nextIn = upcoming ? daysBetween(todayKey(), upcoming.next) : null;
  const latest = (id) => {
    const a = tank.measures?.[id];
    return a && a.length ? a[a.length - 1].v : null;
  };
  const temp = latest("temp");
  const ph = latest("ph");
  const dueLabel =
    nextIn == null ? "All clear" : nextIn <= 0 ? "Due now" : nextIn === 1 ? "in 1 day" : `in ${nextIn} days`;

  return (
    <div style={{
      position: "relative", borderRadius: 22, padding: 16, marginTop: 4, marginBottom: 4,
      background: `linear-gradient(150deg, rgba(63,224,208,0.14), rgba(6,19,25,0.6) 60%), ${T.cardSolid}`,
      border: `1px solid ${T.line}`, overflow: "hidden",
      boxShadow: `0 8px 30px rgba(0,0,0,0.35), inset 0 0 40px rgba(63,224,208,0.05)`,
    }}>
      <div style={{ position: "absolute", top: -30, right: -20, width: 130, height: 130, borderRadius: "50%",
        background: `radial-gradient(circle, ${T.cyan}22, transparent 70%)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, display: "grid", placeItems: "center",
            background: `linear-gradient(135deg, ${T.cyan}, ${T.cyanDim})` }}>
            <Waves size={14} color="#04222a" strokeWidth={2.4} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{tank.name}</div>
        </div>
        <div style={{ fontSize: 9.5, letterSpacing: 0.6, color: T.sub, fontFamily: MONO,
          border: `1px solid ${T.line}`, padding: "2px 7px", borderRadius: 7 }}>WIDGET</div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginTop: 12 }}>
        <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1,
          color: health.score >= 80 ? T.good : health.score >= 55 ? T.gold : T.danger }}>{health.score}</div>
        <div style={{ fontSize: 12, color: T.sub, marginBottom: 4 }}>health</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }}>
        <WChip icon={<Timer size={13} />} label="Next task" value={dueLabel}
          tint={nextIn != null && nextIn <= 0 ? T.coral : T.cyan} />
        <WChip icon={<Thermometer size={13} />} label="Temp" value={temp != null ? `${temp}°` : "—"} tint={T.coral} />
        <WChip icon={<FlaskConical size={13} />} label="pH" value={ph != null ? `${ph}` : "—"} tint={T.cyan} />
      </div>
    </div>
  );
}

function WChip({ icon, label, value, tint }) {
  return (
    <div style={{ background: "rgba(6,19,25,0.45)", border: `1px solid ${T.line}`, borderRadius: 13, padding: "9px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, color: tint }}>{icon}
        <span style={{ fontSize: 9.5, color: T.sub, letterSpacing: 0.3 }}>{label}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function HomeTab({ tank, updateTank, showAds, onUpgrade, premium, setShowPaywall }) {
  const [quickNote, setQuickNote] = useState("");
  const health = healthScore(tank);
  const dueTasks = tank.tasks.filter((t) => !t.done && daysBetween(todayKey(), t.next) <= 0);

  const logAction = (type) => {
    const entry = { id: uid(), date: todayKey(), type, note: "", photo: null };
    updateTank(tank.id, { logs: [entry, ...tank.logs] });
  };
  const completeTask = (id) => {
    updateTank(tank.id, {
      tasks: tank.tasks.map((t) =>
        t.id === id ? { ...t, next: new Date(Date.now() + t.every * 86400000).toISOString().slice(0, 10) } : t),
      logs: [{ id: uid(), date: todayKey(), type: tank.tasks.find(t=>t.id===id).title, note: "", photo: null }, ...tank.logs],
    });
  };
  const saveNote = () => {
    if (!quickNote.trim()) return;
    updateTank(tank.id, { logs: [{ id: uid(), date: todayKey(), type: "Note", note: quickNote.trim(), photo: null }, ...tank.logs] });
    setQuickNote("");
  };

  const fishCount = tank.livestock.reduce((a, l) => a + (l.qty || 1), 0); // review fix: qty aware

  return (
    <>
      {/* glanceable widget (home / lock-screen preview) */}
      <GlanceWidget tank={tank} />

      {/* health dashboard — new feature */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={label}>TANK HEALTH</div>
            <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, marginTop: 4,
              color: health.score >= 80 ? T.good : health.score >= 55 ? T.gold : T.danger }}>
              {health.score}<span style={{ fontSize: 16, color: T.sub }}> / 100</span></div>
          </div>
          <Heart size={22} color={T.coral} fill={T.coral} style={{ opacity: 0.85 }} />
        </div>
        <div style={{ height: 8, borderRadius: 6, background: "#0a2731", marginTop: 12, overflow: "hidden" }}>
          <div style={{ width: `${health.score}%`, height: "100%",
            background: `linear-gradient(90deg, ${T.cyan}, ${T.good})` }} />
        </div>
        {health.flags.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 12, color: T.gold }}>{health.flags[0]}</div>
        )}
        <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
          <Stat label="Livestock" value={fishCount} icon={<Fish size={13} />} />
          <Stat label="Species" value={tank.livestock.length} icon={<Leaf size={13} />} />
          <Stat label="Logs" value={tank.logs.length} icon={<Activity size={13} />} />
        </div>
      </Card>

      {/* due tasks — clear scheduling (review fix) */}
      {dueTasks.length > 0 && (
        <Card>
          <div style={label}>DUE TODAY</div>
          {dueTasks.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0",
              borderBottom: `1px solid ${T.line}` }}>
              <button onClick={() => completeTask(t.id)} style={{ ...iconBtn, width: 30, height: 30,
                border: `1.5px solid ${T.cyan}`, borderRadius: 9 }}><Check size={15} color={T.cyan} /></button>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: T.sub, fontFamily: MONO }}>every {t.every}d</div>
              </div>
              {t.priority === "timeSensitive" && (
                <span style={{ fontSize: 10, color: T.coral, border: `1px solid ${T.coral}55`,
                  padding: "2px 6px", borderRadius: 6, display: "flex", alignItems: "center", gap: 3 }}>
                  <BellRing size={10} /> Time-sensitive</span>
              )}
            </div>
          ))}
        </Card>
      )}

      {/* quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, margin: "4px 0 12px" }}>
        {[
          { t: "Water change", i: <Droplet size={18} /> },
          { t: "Feed", i: <Fish size={18} /> },
          { t: "Dose", i: <FlaskConical size={18} /> },
          { t: "Clean", i: <Sparkles size={18} /> },
        ].map((a) => (
          <button key={a.t} onClick={() => logAction(a.t)} style={quickBtn}>
            <span style={{ color: T.cyan }}>{a.i}</span>
            <span style={{ fontSize: 10.5, marginTop: 5, color: T.sub }}>{a.t}</span>
          </button>
        ))}
      </div>

      {/* quick note — review fix: notes were missing */}
      <Card>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <StickyNote size={16} color={T.sub} />
          <input value={quickNote} onChange={(e) => setQuickNote(e.target.value)}
            placeholder="Add a note for today…" maxLength={280}
            style={{ flex: 1, background: "transparent", border: "none", color: T.text, fontSize: 14,
              outline: "none", fontFamily: FONT }} />
          <button onClick={saveNote} style={{ ...pill, opacity: quickNote.trim() ? 1 : 0.4 }}>Save</button>
        </div>
      </Card>

      {showAds && <AdSlot onUpgrade={onUpgrade} />}

      {/* activity feed */}
      <div style={{ ...label, margin: "6px 4px" }}>ACTIVITY FEED</div>
      {tank.logs.length === 0 && <div style={{ color: T.sub, fontSize: 13, padding: "8px 4px" }}>
        No activity yet. Tap a quick action above to log your first entry.</div>}
      {tank.logs.slice(0, 12).map((l) => (
        <div key={l.id} style={{ display: "flex", gap: 11, padding: "10px 4px", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: T.card, display: "grid",
            placeItems: "center", flex: "0 0 auto" }}><Activity size={15} color={T.cyan} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{l.type}</div>
            {l.note && <div style={{ fontSize: 12.5, color: T.sub, marginTop: 2 }}>{l.note}</div>}
            <div style={{ fontSize: 11, color: T.sub, fontFamily: MONO, marginTop: 2 }}>{l.date}</div>
          </div>
        </div>
      ))}
    </>
  );
}

/* ================= CALENDAR ================= */
function CalendarTab({ tank, updateTank, premium, onUpgrade }) {
  const [month, setMonth] = useState(new Date());
  const [sel, setSel] = useState(todayKey());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", every: 7, priority: "normal" });

  const y = month.getFullYear(), m = month.getMonth();
  const firstDow = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const key = (d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const logsOn = (d) => tank.logs.filter((l) => l.date === key(d)).length +
    tank.tasks.filter((t) => t.next === key(d) && !t.done).length;

  const selLogs = tank.logs.filter((l) => l.date === sel);
  const selTasks = tank.tasks.filter((t) => t.next === sel && !t.done);

  const addTask = () => {
    if (!form.title.trim()) return;
    updateTank(tank.id, { tasks: [...tank.tasks, {
      id: uid(), title: form.title.trim(), every: Number(form.every), next: sel,
      priority: form.priority, done: false }] });
    setForm({ title: "", every: 7, priority: "normal" }); setAdding(false);
  };
  const removeTask = (id) => updateTank(tank.id, { tasks: tank.tasks.filter((t) => t.id !== id) });

  return (
    <>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={() => setMonth(new Date(y, m - 1, 1))} style={iconBtn}><ChevronLeft size={18} color={T.text} /></button>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {month.toLocaleString("en", { month: "long", year: "numeric" })}</div>
          <button onClick={() => setMonth(new Date(y, m + 1, 1))} style={iconBtn}><ChevronRight size={18} color={T.text} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 10, color: T.sub, fontFamily: MONO }}>{d}</div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const k = key(d), isSel = k === sel, isToday = k === todayKey(), n = logsOn(d);
            return (
              <button key={i} onClick={() => setSel(k)} style={{
                aspectRatio: "1", borderRadius: 10, border: isToday ? `1px solid ${T.cyan}` : "1px solid transparent",
                background: isSel ? `linear-gradient(135deg, ${T.cyan}, ${T.cyanDim})` : "transparent",
                color: isSel ? "#04222a" : T.text, fontSize: 13, fontWeight: 600, cursor: "pointer",
                position: "relative", display: "grid", placeItems: "center",
              }}>
                {d}
                {n > 0 && <span style={{ position: "absolute", bottom: 4, width: 5, height: 5, borderRadius: 3,
                  background: isSel ? "#04222a" : T.coral }} />}
              </button>
            );
          })}
        </div>
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 4px 8px" }}>
        <div style={label}>{sel}</div>
        <button onClick={() => setAdding(true)} style={pill}><Plus size={13} /> Schedule</button>
      </div>

      {adding && (
        <Card>
          <input autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Task name" style={input} />
          <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: T.sub }}>Repeat every</span>
            {[1, 3, 7, 14, 30].map((n) => (
              <button key={n} onClick={() => setForm({ ...form, every: n })} style={{
                ...chip, background: form.every === n ? T.cyan : T.card, color: form.every === n ? "#04222a" : T.text,
              }}>{n}d</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: T.sub }}>Priority</span>
            <button onClick={() => setForm({ ...form, priority: "normal" })} style={{
              ...chip, background: form.priority === "normal" ? T.cyan : T.card,
              color: form.priority === "normal" ? "#04222a" : T.text }}>Normal</button>
            <button onClick={() => setForm({ ...form, priority: "timeSensitive" })} style={{
              ...chip, background: form.priority === "timeSensitive" ? T.coral : T.card,
              color: form.priority === "timeSensitive" ? "#04222a" : T.text,
              display: "flex", alignItems: "center", gap: 4 }}><BellRing size={11} /> Time-sensitive</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={addTask} style={{ ...pill, flex: 1, justifyContent: "center", padding: "10px" }}>Add task</button>
            <button onClick={() => setAdding(false)} style={{ ...iconBtn, width: 40 }}><X size={16} color={T.sub} /></button>
          </div>
        </Card>
      )}

      {selTasks.map((t) => (
        <Card key={t.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Bell size={16} color={t.priority === "timeSensitive" ? T.coral : T.cyan} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div>
              <div style={{ fontSize: 11, color: T.sub, fontFamily: MONO }}>
                every {t.every}d {t.priority === "timeSensitive" ? "· time-sensitive" : ""}</div>
            </div>
            <button onClick={() => removeTask(t.id)} style={iconBtn}><Trash2 size={15} color={T.danger} /></button>
          </div>
        </Card>
      ))}
      {selLogs.map((l) => (
        <div key={l.id} style={{ display: "flex", gap: 11, padding: "10px 4px", borderBottom: `1px solid ${T.line}` }}>
          <Check size={15} color={T.good} style={{ marginTop: 3 }} />
          <div><div style={{ fontSize: 14, fontWeight: 600 }}>{l.type}</div>
            {l.note && <div style={{ fontSize: 12.5, color: T.sub }}>{l.note}</div>}</div>
        </div>
      ))}
      {selTasks.length === 0 && selLogs.length === 0 && !adding && (
        <div style={{ color: T.sub, fontSize: 13, padding: "8px 4px" }}>
          Nothing scheduled. Tap Schedule to add a recurring task.</div>
      )}
    </>
  );
}

/* ================= GRAPHS ================= */
function GraphsTab({ tank, updateTank }) {
  const [selParam, setSelParam] = useState(PARAM_PRESETS[0].id);
  const [val, setVal] = useState("");
  const [thVal, setThVal] = useState("");
  const params = PARAM_PRESETS;
  const p = params.find((x) => x.id === selParam);
  const data = tank.measures?.[selParam] || [];
  const thresholds = tank.thresholds?.[selParam] || [];

  const record = () => {
    if (val === "" || isNaN(Number(val))) return;
    const next = { ...(tank.measures || {}) };
    next[selParam] = [...(next[selParam] || []), { d: todayKey(), v: Number(val) }].slice(-30);
    updateTank(tank.id, { measures: next });
    setVal("");
  };
  const addThreshold = () => {
    if (thVal === "" || isNaN(Number(thVal))) return;
    const colors = [T.danger, T.cyan, T.gold, "#a78bfa"];
    const next = { ...(tank.thresholds || {}) };
    const arr = next[selParam] || [];
    next[selParam] = [...arr, { id: uid(), v: Number(thVal), color: colors[arr.length % colors.length] }];
    updateTank(tank.id, { thresholds: next });
    setThVal("");
  };
  const removeThreshold = (id) => {
    const next = { ...(tank.thresholds || {}) };
    next[selParam] = (next[selParam] || []).filter((t) => t.id !== id);
    updateTank(tank.id, { thresholds: next });
  };
  const exportCSV = () => {
    const rows = [["param", "date", "value"]];
    params.forEach((pp) => (tank.measures?.[pp.id] || []).forEach((m) => rows.push([pp.name, m.d, m.v])));
    const csv = rows.map((r) => r.join(",")).join("\n");
    console.log("CSV EXPORT:\n" + csv);
    alert("Exported to CSV (check logs). In-app this saves a .csv file.");
  };

  const thVals = thresholds.map((t) => t.v);
  const vals = data.map((d) => d.v);
  const max = Math.max(...vals, ...thVals, p.hi || 1), min = Math.min(...vals, ...thVals, p.lo || 0);
  const range = max - min || 1;
  const yFor = (v) => 130 - ((v - min) / range) * 120 - 5;

  return (
    <>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 4 }}>
        {params.map((pp) => (
          <button key={pp.id} onClick={() => setSelParam(pp.id)} style={{
            flex: "0 0 auto", padding: "8px 13px", borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${T.line}`, background: pp.id === selParam ? pp.color : T.card,
            color: pp.id === selParam ? "#04222a" : T.text }}>{pp.name}</button>
        ))}
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={label}>{p.name} {p.unit && `(${p.unit})`}</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: T.sub }}>
            latest {vals[vals.length - 1] ?? "—"}{p.unit}</div>
        </div>
        <svg viewBox="0 0 300 130" style={{ width: "100%", marginTop: 10 }} preserveAspectRatio="none">
          <rect x="0" y={yFor(p.hi)} width="300"
            height={Math.max(0, yFor(p.lo) - yFor(p.hi))} fill={`${p.color}10`} />
          {/* custom threshold lines */}
          {thresholds.map((t) => (
            <g key={t.id}>
              <line x1="0" x2="300" y1={yFor(t.v)} y2={yFor(t.v)} stroke={t.color}
                strokeWidth="1.5" strokeDasharray="5 4" />
            </g>
          ))}
          {data.length > 1 && (
            <>
              <polyline fill={`${p.color}18`} stroke="none"
                points={`0,125 ${data.map((d, i) => `${(i / (data.length - 1)) * 300},${yFor(d.v)}`).join(" ")} 300,125`} />
              <polyline fill="none" stroke={p.color} strokeWidth="2.5" strokeLinejoin="round"
                points={data.map((d, i) => `${(i / (data.length - 1)) * 300},${yFor(d.v)}`).join(" ")} />
            </>
          )}
          {data.map((d, i) => (
            <circle key={i} cx={data.length > 1 ? (i / (data.length - 1)) * 300 : 150}
              cy={yFor(d.v)} r="3.5" fill={p.color} />
          ))}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, color: T.sub }}>
          <span>{data[0]?.d?.slice(5) || "—"}</span>
          <span>{data[data.length - 1]?.d?.slice(5) || "—"}</span>
        </div>
      </Card>

      <Card>
        <div style={label}>RECORD MEASUREMENT</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input value={val} onChange={(e) => setVal(e.target.value)} type="number" inputMode="decimal"
            placeholder={`${p.name} today`} style={{ ...input, flex: 1 }} />
          <button onClick={record} style={{ ...pill, padding: "0 18px" }}>Log</button>
        </div>
      </Card>

      {/* threshold lines — real app feature */}
      <Card>
        <div style={label}>THRESHOLD LINES</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input value={thVal} onChange={(e) => setThVal(e.target.value)} type="number" inputMode="decimal"
            placeholder={`Add line at… (${p.unit || p.name})`} style={{ ...input, flex: 1 }} />
          <button onClick={addThreshold} style={{ ...pill, padding: "0 16px" }}>Add</button>
        </div>
        {thresholds.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 10 }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: t.color }} />
            <span style={{ flex: 1, fontSize: 14, fontFamily: MONO }}>{t.v}{p.unit}</span>
            <button onClick={() => removeThreshold(t.id)} style={iconBtn}><Trash2 size={15} color={T.danger} /></button>
          </div>
        ))}
        {thresholds.length === 0 && <div style={{ fontSize: 12, color: T.sub, marginTop: 8 }}>
          Add a line to mark your safe max or target (e.g. Nitrate 25ppm).</div>}
      </Card>

      <button onClick={exportCSV} style={{ ...pill, width: "100%", justifyContent: "center", padding: 12,
        background: T.card, color: T.cyan, border: `1px solid ${T.line}` }}>
        <BarChart3 size={15} /> Export all measurements as CSV</button>
    </>
  );
}

/* ================= GALLERY ================= */
function GalleryTab({ tank, updateTank, premium, onUpgrade }) {
  const fileRef = useRef();
  const add = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!premium && (tank.photos?.length || 0) >= 6) { onUpgrade(); return; } // free cap
    const reader = new FileReader();
    reader.onload = () => updateTank(tank.id, {
      photos: [{ id: uid(), src: reader.result, date: todayKey(), tag: "" }, ...(tank.photos || [])] });
    reader.readAsDataURL(f);
  };
  const remove = (id) => updateTank(tank.id, { photos: tank.photos.filter((p) => p.id !== id) });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 4px 10px" }}>
        <div style={label}>{tank.name} · Album</div>
        <button onClick={() => fileRef.current.click()} style={pill}><Camera size={14} /> Add photo</button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={add} />
      </div>
      {(tank.photos?.length || 0) === 0 ? (
        <div style={{ textAlign: "center", color: T.sub, padding: "48px 20px" }}>
          <ImageIcon size={38} color={T.cyanDim} style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 14 }}>Build a photo timeline of your tank.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Track growth and color over time — multiple photos per tank.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {tank.photos.map((p) => (
            <div key={p.id} style={{ position: "relative", borderRadius: 14, overflow: "hidden",
              border: `1px solid ${T.line}` }}>
              <img src={p.src} alt="" style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 8px",
                background: "linear-gradient(transparent, rgba(4,20,26,0.9))", fontSize: 11, fontFamily: MONO }}>{p.date}</div>
              <button onClick={() => remove(p.id)} style={{ position: "absolute", top: 6, right: 6,
                ...iconBtn, width: 26, height: 26, background: "rgba(4,20,26,0.7)" }}>
                <X size={13} color="#fff" /></button>
            </div>
          ))}
        </div>
      )}
      {!premium && (tank.photos?.length || 0) >= 4 && (
        <div style={{ marginTop: 14, fontSize: 12, color: T.gold, textAlign: "center" }}>
          Free albums hold 6 photos. Upgrade for unlimited.</div>
      )}
    </>
  );
}

/* ================= TOOLS (database + calculators + timers) ================= */
function ToolsTab({ tank, updateTank, premium, onUpgrade, customFish, setCustomFish }) {
  const [view, setView] = useState("menu"); // menu | database | dosing | wc | timers

  if (view === "database")
    return <Database tank={tank} updateTank={updateTank} customFish={customFish}
      setCustomFish={setCustomFish} back={() => setView("menu")} />;
  if (view === "dosing")
    return <DosingCalc tank={tank} premium={premium} onUpgrade={onUpgrade} back={() => setView("menu")} />;
  if (view === "wc")
    return <WaterChangeCalc tank={tank} back={() => setView("menu")} />;
  if (view === "timers")
    return <Timers back={() => setView("menu")} />;

  const tiles = [
    { id: "database", i: <BookOpen size={20} />, t: "Livestock Database", s: "Fish, coral, plants & inverts — add your own", free: true },
    { id: "wc", i: <Droplet size={20} />, t: "Water-Change Calculator", s: "Volume & dilution for any tank", free: true },
    { id: "timers", i: <Timer size={20} />, t: "Test Timers", s: "Multiple stopwatches for water tests", free: true },
    { id: "dosing", i: <Beaker size={20} />, t: "Dosing Calculator", s: "Ca, Alk, Mg & fertilizer dosing", free: false },
  ];
  return (
    <>
      <div style={{ ...label, margin: "6px 4px 10px" }}>AQUARIST TOOLS</div>
      {tiles.map((tl) => (
        <button key={tl.id} onClick={() => (tl.free || premium ? setView(tl.id) : onUpgrade())}
          style={{ width: "100%", textAlign: "left", cursor: "pointer", marginBottom: 10,
            background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, padding: 15,
            display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${T.cyan}18`,
            display: "grid", placeItems: "center", color: T.cyan, flex: "0 0 auto" }}>{tl.i}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{tl.t}</div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{tl.s}</div>
          </div>
          {!tl.free && !premium && <Crown size={16} color={T.gold} />}
          <ChevronRight size={18} color={T.sub} />
        </button>
      ))}
    </>
  );
}

function ToolHeader({ title, back }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 12px" }}>
      <button onClick={back} style={iconBtn}><ArrowLeft size={19} color={T.text} /></button>
      <span style={{ fontSize: 17, fontWeight: 700 }}>{title}</span>
    </div>
  );
}

/* ---- Livestock database with search + add-your-own + add-to-tank ---- */
function Database({ tank, updateTank, customFish, setCustomFish, back }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState(null);
  const [nf, setNf] = useState({ name: "", kind: "Fish", water: "Fresh", care: "Easy", note: "" });
  const all = [...customFish, ...FISH_DB];
  const kinds = ["All", "Fish", "Invert", "Coral", "Plant"];
  const results = all.filter((f) =>
    (filter === "All" || f.kind === filter) &&
    (f.name.toLowerCase().includes(q.toLowerCase()) ||
     (f.sci || "").toLowerCase().includes(q.toLowerCase())));

  const gradFor = (f) => ({
    Fish: "linear-gradient(160deg,#0a3d4a,#2fbf9f)",
    Invert: "linear-gradient(160deg,#4a2f0a,#d3b57b)",
    Coral: "linear-gradient(160deg,#3a1f4a,#c07bd3)",
    Plant: "linear-gradient(160deg,#123d24,#7bd389)",
  }[f.kind] || T.cardSolid);

  const addToTank = (f) => {
    const existing = tank.livestock.find((l) => l.name === f.name);
    if (existing)
      updateTank(tank.id, { livestock: tank.livestock.map((l) =>
        l.name === f.name ? { ...l, qty: (l.qty || 1) + 1 } : l) });
    else
      updateTank(tank.id, { livestock: [...tank.livestock, { id: uid(), name: f.name, qty: 1, kind: f.kind }] });
  };
  const saveNew = () => {
    if (!nf.name.trim()) return;
    setCustomFish([{ id: uid(), ...nf, name: nf.name.trim(), custom: true,
      sci: "", temp: "—", ph: "—", min: 0 }, ...customFish]);
    setNf({ name: "", kind: "Fish", water: "Fresh", care: "Easy", note: "" }); setAdding(false);
  };

  /* ---- species detail page (matches real app depth) ---- */
  if (detail) {
    const f = detail;
    return (
      <>
        <ToolHeader title="Species" back={() => setDetail(null)} />
        <div style={{ height: 210, borderRadius: 18, background: gradFor(f), position: "relative",
          display: "grid", placeItems: "center", marginBottom: 14, overflow: "hidden" }}>
          {f.kind === "Fish" ? <Fish size={64} color="#ffffff55" /> :
           f.kind === "Plant" ? <Leaf size={64} color="#ffffff55" /> :
           <Waves size={64} color="#ffffff55" />}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{f.name}</div>
        {f.sci && <div style={{ fontSize: 14, color: T.sub, fontStyle: "italic", marginTop: 2 }}>{f.sci}</div>}
        <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
          <button onClick={() => { addToTank(f); }} style={{ ...pill, padding: "9px 14px" }}>
            <Plus size={14} /> Add to {tank.name}</button>
        </div>
        <div style={{ display: "flex", gap: 7, marginTop: 14, flexWrap: "wrap" }}>
          <Tag>{f.kind}</Tag><Tag>{f.water}water</Tag>
          <Tag color={f.care === "Easy" ? T.good : f.care === "Hard" ? T.danger : T.gold}>Care: {f.care}</Tag>
        </div>
        {f.min > 0 && (
          <Card>
            <div style={label}>REQUIREMENTS</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              <ReqCol icon={<Thermometer size={15} color={T.coral} />} label="Temp" val={f.temp} />
              <ReqCol icon={<FlaskConical size={15} color={T.cyan} />} label="pH" val={f.ph} />
              <ReqCol icon={<Droplet size={15} color={T.cyan} />} label="Min tank" val={`${f.min} gal`} />
            </div>
          </Card>
        )}
        {f.note && (
          <Card>
            <div style={label}>ABOUT</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: T.text, marginTop: 8 }}>{f.note}</div>
          </Card>
        )}
      </>
    );
  }

  return (
    <>
      <ToolHeader title="Livestock Database" back={back} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0a2731",
        border: `1px solid ${T.line}`, borderRadius: 12, padding: "10px 12px", marginBottom: 10 }}>
        <Search size={16} color={T.sub} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search species…"
          style={{ flex: 1, background: "transparent", border: "none", color: T.text, outline: "none",
            fontSize: 14, fontFamily: FONT }} />
        <button onClick={() => setAdding(true)} style={{ ...chip, background: T.cyan, color: "#04222a",
          display: "flex", alignItems: "center", gap: 4 }}><Plus size={13} /> Add</button>
      </div>

      <div style={{ display: "flex", gap: 7, marginBottom: 10, overflowX: "auto" }}>
        {kinds.map((k) => (
          <button key={k} onClick={() => setFilter(k)} style={{ ...chip, flex: "0 0 auto",
            background: filter === k ? T.cyan : T.card, color: filter === k ? "#04222a" : T.text }}>{k}</button>
        ))}
      </div>

      {adding && (
        <Card>
          <div style={label}>ADD YOUR OWN SPECIES</div>
          <input autoFocus value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })}
            placeholder="Species name" style={{ ...input, marginTop: 10 }} />
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {["Fish", "Invert", "Coral", "Plant"].map((k) => (
              <button key={k} onClick={() => setNf({ ...nf, kind: k })} style={{ ...chip,
                background: nf.kind === k ? T.cyan : T.card, color: nf.kind === k ? "#04222a" : T.text }}>{k}</button>
            ))}
          </div>
          <input value={nf.note} onChange={(e) => setNf({ ...nf, note: e.target.value })}
            placeholder="Care notes (optional)" style={{ ...input, marginTop: 10 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={saveNew} style={{ ...pill, flex: 1, justifyContent: "center", padding: 10 }}>Save species</button>
            <button onClick={() => setAdding(false)} style={{ ...iconBtn, width: 40 }}><X size={16} color={T.sub} /></button>
          </div>
        </Card>
      )}

      {results.map((f) => (
        <Card key={f.id}>
          <div onClick={() => setDetail(f)} style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, flex: "0 0 auto", background: gradFor(f),
              display: "grid", placeItems: "center" }}>
              {f.kind === "Fish" ? <Fish size={20} color="#ffffff88" /> :
               f.kind === "Plant" ? <Leaf size={20} color="#ffffff88" /> :
               <Waves size={20} color="#ffffff88" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{f.name}</span>
                {f.custom && <span style={{ fontSize: 9, color: T.gold, border: `1px solid ${T.gold}55`,
                  padding: "1px 5px", borderRadius: 5 }}>YOURS</span>}
              </div>
              {f.sci && <div style={{ fontSize: 12, color: T.sub, fontStyle: "italic" }}>{f.sci}</div>}
              <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                <Tag>{f.kind}</Tag>
                <Tag color={f.care === "Easy" ? T.good : f.care === "Hard" ? T.danger : T.gold}>{f.care}</Tag>
              </div>
            </div>
            <ChevronRight size={18} color={T.sub} />
          </div>
          <button onClick={() => addToTank(f)} style={{ ...pill, marginTop: 10, padding: "7px 12px" }}>
            <Plus size={13} /> Add to {tank.name}</button>
        </Card>
      ))}
      {results.length === 0 && <div style={{ color: T.sub, fontSize: 13, padding: 12, textAlign: "center" }}>
        No match. Tap “Add” to create this species.</div>}
    </>
  );
}
const Tag = ({ children, color = T.cyan }) => (
  <span style={{ fontSize: 10.5, color, border: `1px solid ${color}44`, padding: "2px 7px",
    borderRadius: 6, fontFamily: MONO }}>{children}</span>
);
const ReqCol = ({ icon, label, val }) => (
  <div style={{ textAlign: "center", flex: 1 }}>
    <div style={{ display: "grid", placeItems: "center", marginBottom: 5 }}>{icon}</div>
    <div style={{ fontSize: 10, color: T.sub, fontFamily: MONO }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{val}</div>
  </div>
);

/* ---- Water-change calculator ---- */
function WaterChangeCalc({ tank, back }) {
  const [pct, setPct] = useState(25);
  const gal = (tank.volume * pct) / 100;
  return (
    <>
      <ToolHeader title="Water-Change Calculator" back={back} />
      <Card>
        <div style={label}>{tank.name} · {tank.volume} GALLONS</div>
        <div style={{ fontSize: 13, color: T.sub, margin: "14px 0 8px" }}>Change percentage</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[10, 20, 25, 30, 50].map((p) => (
            <button key={p} onClick={() => setPct(p)} style={{ ...chip,
              background: pct === p ? T.cyan : T.card, color: pct === p ? "#04222a" : T.text }}>{p}%</button>
          ))}
        </div>
        <input type="range" min="5" max="90" value={pct} onChange={(e) => setPct(Number(e.target.value))}
          style={{ width: "100%", marginTop: 16, accentColor: T.cyan }} />
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <div style={{ fontSize: 46, fontWeight: 700, color: T.cyan }}>{gal.toFixed(1)}</div>
          <div style={{ fontSize: 13, color: T.sub }}>gallons to replace ({pct}%)</div>
          <div style={{ fontSize: 12, color: T.sub, fontFamily: MONO, marginTop: 6 }}>
            ≈ {(gal * 3.785).toFixed(1)} liters</div>
        </div>
      </Card>
      <div style={{ fontSize: 12, color: T.sub, padding: "0 6px", lineHeight: 1.5 }}>
        Match new water temperature and salinity before adding. For saltwater, mix and aerate
        RODI water 24h ahead.</div>
    </>
  );
}

/* ---- Dosing calculator (premium) ---- */
function DosingCalc({ tank, premium, onUpgrade, back }) {
  const [supp, setSupp] = useState("Alkalinity");
  const [cur, setCur] = useState("");
  const [target, setTarget] = useState("");
  const supps = {
    Alkalinity: { unit: "dKH", factor: 0.14, name: "2-part Alk" },
    Calcium: { unit: "ppm", factor: 0.008, name: "2-part Ca" },
    Magnesium: { unit: "ppm", factor: 0.006, name: "Mg supplement" },
  };
  const s = supps[supp];
  const diff = Number(target) - Number(cur);
  const dose = cur && target && diff > 0 ? (diff * s.factor * tank.volume).toFixed(1) : null;
  return (
    <>
      <ToolHeader title="Dosing Calculator" back={back} />
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {Object.keys(supps).map((k) => (
          <button key={k} onClick={() => setSupp(k)} style={{ ...chip, flex: 1, justifyContent: "center",
            display: "flex", background: supp === k ? T.cyan : T.card, color: supp === k ? "#04222a" : T.text }}>{k}</button>
        ))}
      </div>
      <Card>
        <div style={label}>CURRENT & TARGET ({s.unit})</div>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input value={cur} onChange={(e) => setCur(e.target.value)} type="number" inputMode="decimal"
            placeholder="Current" style={{ ...input, flex: 1 }} />
          <input value={target} onChange={(e) => setTarget(e.target.value)} type="number" inputMode="decimal"
            placeholder="Target" style={{ ...input, flex: 1 }} />
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          {dose ? (
            <>
              <div style={{ fontSize: 42, fontWeight: 700, color: T.cyan }}>{dose} ml</div>
              <div style={{ fontSize: 13, color: T.sub }}>of {s.name} for {tank.volume} gal</div>
              <div style={{ fontSize: 11, color: T.gold, marginTop: 8 }}>
                Dose gradually — raise no more than 1 {s.unit}/day.</div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: T.sub, padding: 10 }}>
              {diff < 0 ? "Target is below current — no dose needed." : "Enter current and target values."}</div>
          )}
        </div>
      </Card>
      <div style={{ fontSize: 11, color: T.sub, padding: "0 6px" }}>
        Estimates only. Always verify with a test kit before and after dosing. Product concentrations vary by brand.</div>
    </>
  );
}

/* ---- Multiple test timers (review/description feature) ---- */
function Timers({ back }) {
  const [timers, setTimers] = useState([
    { id: uid(), label: "Nitrate test", sec: 300, left: 300, running: false },
  ]);
  useEffect(() => {
    const iv = setInterval(() => {
      setTimers((ts) => ts.map((t) => t.running && t.left > 0 ? { ...t, left: t.left - 1 } : t));
    }, 1000);
    return () => clearInterval(iv);
  }, []);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const add = () => setTimers((ts) => [...ts, { id: uid(), label: "New test", sec: 180, left: 180, running: false }]);
  const toggle = (id) => setTimers((ts) => ts.map((t) => t.id === id ? { ...t, running: !t.running } : t));
  const reset = (id) => setTimers((ts) => ts.map((t) => t.id === id ? { ...t, left: t.sec, running: false } : t));
  const remove = (id) => setTimers((ts) => ts.filter((t) => t.id !== id));
  const setDur = (id, sec) => setTimers((ts) => ts.map((t) => t.id === id ? { ...t, sec, left: sec, running: false } : t));

  return (
    <>
      <ToolHeader title="Test Timers" back={back} />
      {timers.map((t) => (
        <Card key={t.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <input value={t.label} onChange={(e) => setTimers((ts) => ts.map((x) =>
              x.id === t.id ? { ...x, label: e.target.value } : x))}
              style={{ background: "transparent", border: "none", color: T.text, fontSize: 14,
                fontWeight: 600, outline: "none", fontFamily: FONT, flex: 1 }} />
            <button onClick={() => remove(t.id)} style={iconBtn}><Trash2 size={15} color={T.danger} /></button>
          </div>
          <div style={{ textAlign: "center", margin: "6px 0" }}>
            <div style={{ fontSize: 44, fontWeight: 700, fontFamily: MONO,
              color: t.left === 0 ? T.coral : t.running ? T.cyan : T.text }}>{fmt(t.left)}</div>
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 10 }}>
            {[60, 180, 300, 600].map((d) => (
              <button key={d} onClick={() => setDur(t.id, d)} style={{ ...chip,
                background: t.sec === d ? T.cyan : T.card, color: t.sec === d ? "#04222a" : T.text }}>{d / 60}m</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => toggle(t.id)} style={{ ...pill, flex: 1, justifyContent: "center", padding: 10 }}>
              {t.running ? "Pause" : "Start"}</button>
            <button onClick={() => reset(t.id)} style={{ ...pill, background: T.card, color: T.cyan,
              border: `1px solid ${T.line}`, padding: "0 16px" }}>Reset</button>
          </div>
        </Card>
      ))}
      <button onClick={add} style={{ ...pill, width: "100%", justifyContent: "center", padding: 12,
        background: T.card, color: T.cyan, border: `1px dashed ${T.line}` }}>
        <Plus size={15} /> Add timer</button>
    </>
  );
}

/* ================= COMMUNITY ================= */
function CommunityTab({ tank, community, setCommunity }) {
  const fileRef = useRef();
  const [liked, setLiked] = useState({});

  const toggleLike = (id) => {
    setLiked((l) => ({ ...l, [id]: !l[id] }));
    setCommunity(community.map((p) =>
      p.id === id ? { ...p, likes: p.likes + (liked[id] ? -1 : 1) } : p));
  };
  const post = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setCommunity([
      { id: uid(), user: "you", tank: tank.name, src: reader.result, likes: 0, mine: true },
      ...community,
    ]);
    reader.readAsDataURL(f);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 4px 12px" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Showcase</div>
          <div style={{ fontSize: 12, color: T.sub }}>See what other aquarists are keeping</div>
        </div>
        <button onClick={() => fileRef.current.click()} style={pill}><Share2 size={14} /> Post tank</button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={post} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {community.map((p) => (
          <div key={p.id} style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${T.line}`,
            background: T.card }}>
            <div style={{ height: 140, background: p.grad || T.cardSolid, position: "relative" }}>
              {p.src && <img src={p.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              {p.mine && <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 700,
                background: T.cyan, color: "#04222a", padding: "2px 7px", borderRadius: 6 }}>YOURS</span>}
            </div>
            <div style={{ padding: "9px 11px" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.tank}</div>
              <div style={{ fontSize: 11, color: T.sub, marginBottom: 6 }}>@{p.user}</div>
              <button onClick={() => toggleLike(p.id)} style={{ display: "flex", alignItems: "center", gap: 5,
                background: "none", border: "none", cursor: "pointer", color: liked[p.id] ? T.coral : T.sub,
                fontSize: 12, fontFamily: FONT, padding: 0 }}>
                <Heart size={14} fill={liked[p.id] ? T.coral : "none"} /> {p.likes}</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: T.sub, margin: "16px 0", fontFamily: MONO }}>
        Be kind. Share tips, not spam.</div>
    </>
  );
}

/* ================= SETTINGS ================= */
function SettingsTab({ premium, adsRemoved, onUpgrade, tanks }) {
  const [dataView, setDataView] = useState(false);
  const dataCount = tanks.reduce((a, t) =>
    a + t.logs.length + t.livestock.length + (t.photos?.length || 0) +
    Object.values(t.measures || {}).reduce((s, arr) => s + arr.length, 0), 0);

  const exportData = async () => {
    try {
      const r = await window.storage.get("reeflog:v1");
      const blob = r?.value || "{}";
      console.log("BACKUP EXPORT:\n" + blob);
      alert(`Backed up ${dataCount} records. In-app this uploads to your cloud account.`);
    } catch { alert("Nothing to back up yet."); }
  };

  const Row = ({ icon, title, sub, right, onClick }) => (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0",
      borderBottom: `1px solid ${T.line}`, cursor: onClick ? "pointer" : "default" }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: T.card, display: "grid", placeItems: "center" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: T.sub }}>{sub}</div>}
      </div>
      {right}
    </div>
  );

  if (dataView) {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 14px" }}>
          <button onClick={() => setDataView(false)} style={iconBtn}><ArrowLeft size={19} color={T.text} /></button>
          <span style={{ fontSize: 17, fontWeight: 700 }}>Data Management</span>
        </div>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ textAlign: "center" }}>
              <StickyNote size={26} color={T.cyan} />
              <div style={{ fontSize: 12, color: T.sub, marginTop: 6 }}>On device</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{dataCount} records</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, color: T.sub }}>
              <ArrowLeft size={14} style={{ transform: "rotate(180deg)" }} /><ArrowLeft size={14} /></div>
            <div style={{ textAlign: "center" }}>
              <Cloud size={26} color={premium ? T.cyan : T.sub} />
              <div style={{ fontSize: 12, color: T.sub, marginTop: 6 }}>{premium ? "Synced" : "Not backed up"}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{premium ? dataCount : 0} records</div>
            </div>
          </div>
        </Card>
        <button onClick={premium ? exportData : onUpgrade} style={{ ...pill, width: "100%", justifyContent: "space-between",
          padding: 15, background: T.card, color: T.text, border: `1px solid ${T.line}`, marginBottom: 10 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Upload size={16} color={T.cyan} /> Export (Upload)</span>
          {!premium && <Crown size={15} color={T.gold} />}</button>
        <button onClick={premium ? () => alert("In-app this restores from your cloud backup.") : onUpgrade}
          style={{ ...pill, width: "100%", justifyContent: "space-between", padding: 15, background: T.card,
            color: T.text, border: `1px solid ${T.line}` }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Download size={16} color={T.cyan} /> Import (Download)</span>
          {!premium && <Crown size={15} color={T.gold} />}</button>
        <div style={{ fontSize: 12, color: T.sub, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          Your data auto-saves on this device. {premium ? "Cloud backup keeps a copy you can restore on any phone."
          : "Upgrade to Premium to back up and restore across devices."}</div>
      </>
    );
  }

  return (
    <>
      {!premium && (
        <button onClick={onUpgrade} style={{ width: "100%", textAlign: "left", cursor: "pointer",
          border: "none", borderRadius: 18, padding: 18, marginBottom: 12,
          background: `linear-gradient(135deg, ${T.cyanDim}, #0d3540)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.gold, fontWeight: 700, fontSize: 15 }}>
            <Crown size={18} /> Reeflog Premium</div>
          <div style={{ fontSize: 12.5, color: T.text, marginTop: 6, opacity: 0.9 }}>
            Unlimited tanks & photos, no ads, cloud backup, dosing calculator.</div>
          <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: T.cyan }}>From $2.99/mo →</div>
        </button>
      )}
      <Card>
        <Row icon={<Crown size={16} color={premium ? T.gold : T.sub} />} title="Membership"
          sub={premium ? "Premium — active" : adsRemoved ? "Ads removed" : "Free plan"}
          right={!premium && <button onClick={onUpgrade} style={pill}>Upgrade</button>} />
        <Row icon={<Cloud size={16} color={T.cyan} />} title="Cloud backup & restore"
          sub={premium ? "Tap to manage" : "Premium — tap to view"} onClick={() => setDataView(true)}
          right={<ChevronRight size={18} color={T.sub} />} />
        <Row icon={<Waves size={16} color={T.cyan} />} title="Tanks" sub={`${tanks.length} tank${tanks.length>1?"s":""} · auto-saved`} />
        <Row icon={<Bell size={16} color={T.cyan} />} title="Notifications" sub="Time-sensitive alerts enabled" />
      </Card>
      <div style={{ textAlign: "center", fontSize: 11, color: T.sub, marginTop: 20, fontFamily: MONO }}>
        Reeflog v1.0 · data stored on-device</div>
    </>
  );
}

/* ================= PAYWALL ================= */
function Paywall({ onClose, onSubscribe, onRemoveAds }) {
  const [plan, setPlan] = useState("year");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(3,15,20,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 440, background: `linear-gradient(180deg, #0c2731, ${T.bg})`,
        borderRadius: "24px 24px 0 0", padding: "22px 20px 32px", border: `1px solid ${T.line}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Crown size={20} color={T.gold} />
            <span style={{ fontSize: 19, fontWeight: 700 }}>Reeflog Premium</span></div>
          <button onClick={onClose} style={iconBtn}><X size={18} color={T.sub} /></button>
        </div>

        <div style={{ marginTop: 16, display: "grid", gap: 9 }}>
          {["Unlimited tanks & photo albums", "Remove all ads", "Cloud backup & restore",
            "Water-change & dosing calculators", "Unlimited custom parameters"].map((f) => (
            <div key={f} style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 13.5 }}>
              <Check size={15} color={T.good} /> {f}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
          <button onClick={() => setPlan("month")} style={planCard(plan === "month")}>
            <div style={{ fontSize: 12, color: T.sub }}>Monthly</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>$2.99</div>
            <div style={{ fontSize: 11, color: T.sub }}>per month</div>
          </button>
          <button onClick={() => setPlan("year")} style={planCard(plan === "year")}>
            <div style={{ position: "absolute", top: -9, right: 10, background: T.coral, color: "#04222a",
              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 7 }}>SAVE 44%</div>
            <div style={{ fontSize: 12, color: T.sub }}>Yearly</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>$19.99</div>
            <div style={{ fontSize: 11, color: T.sub }}>$1.67/mo</div>
          </button>
        </div>

        <button onClick={onSubscribe} style={{ width: "100%", marginTop: 16, padding: 15, borderRadius: 14,
          border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15, color: "#04222a",
          background: `linear-gradient(135deg, ${T.cyan}, ${T.cyanDim})`, boxShadow: `0 6px 20px ${T.cyan}44` }}>
          Start {plan === "year" ? "Yearly" : "Monthly"} — {plan === "year" ? "$19.99/yr" : "$2.99/mo"}</button>

        <button onClick={onRemoveAds} style={{ width: "100%", marginTop: 10, padding: 13, borderRadius: 14,
          background: "transparent", border: `1px solid ${T.line}`, color: T.text, cursor: "pointer", fontSize: 13.5 }}>
          Just remove ads — $6.99 once</button>

        <div style={{ textAlign: "center", fontSize: 10.5, color: T.sub, marginTop: 12 }}>
          Cancel anytime. Auto-renews until cancelled.</div>
      </div>
    </div>
  );
}

/* ================= SMALL PIECES ================= */
function AdSlot({ onUpgrade }) {
  // review fix: ad is non-blocking, dismissible, sits in feed only
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 14,
      background: "rgba(255,209,102,0.08)", border: `1px solid ${T.gold}33`, margin: "6px 0 12px" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.gold}22`, display: "grid",
        placeItems: "center", flex: "0 0 auto" }}><FlaskConical size={18} color={T.gold} /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: T.sub, fontFamily: MONO }}>SPONSORED · AQUARIUM GEAR</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Premium reef test kits</div>
      </div>
      <button onClick={onUpgrade} style={{ ...chip, background: "transparent", border: `1px solid ${T.line}`,
        color: T.cyan, fontSize: 11 }}>Remove</button>
    </div>
  );
}

function healthScore(tank) {
  let score = 100; const flags = [];
  PARAM_PRESETS.forEach((p) => {
    const arr = tank.measures?.[p.id]; if (!arr?.length) return;
    const v = arr[arr.length - 1].v;
    if (p.hi != null && v > p.hi) { score -= 15; flags.push(`${p.name} high (${v}${p.unit})`); }
    if (p.lo != null && v < p.lo) { score -= 10; flags.push(`${p.name} low (${v}${p.unit})`); }
  });
  const lastLog = tank.logs[0]?.date;
  if (!lastLog || daysBetween(lastLog, todayKey()) > 10) { score -= 10; flags.push("No recent maintenance logged"); }
  return { score: Math.max(0, Math.min(100, score)), flags };
}

function Card({ children }) {
  return <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 18,
    padding: 16, marginBottom: 12, backdropFilter: "blur(8px)" }}>{children}</div>;
}
function Stat({ label, value, icon }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, color: T.sub, fontSize: 11, fontFamily: MONO }}>
        {icon}{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  );
}
function TabBar({ tab, setTab }) {
  const items = [
    { id: "home", i: Home, l: "Home" },
    { id: "calendar", i: CalIcon, l: "Calendar" },
    { id: "graphs", i: BarChart3, l: "Graphs" },
    { id: "community", i: Users, l: "Community" },
    { id: "tools", i: Wrench, l: "Tools" },
  ];
  return (
    <div style={{ position: "sticky", bottom: 0, display: "flex", justifyContent: "space-around",
      padding: "10px 8px calc(10px + env(safe-area-inset-bottom))", background: "rgba(5,20,26,0.92)",
      backdropFilter: "blur(12px)", borderTop: `1px solid ${T.line}` }}>
      {items.map((it) => {
        const on = tab === it.id; const Icon = it.i;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{ background: "none", border: "none",
            cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: on ? T.cyan : T.sub, flex: 1 }}>
            <Icon size={21} strokeWidth={on ? 2.4 : 2} />
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 500 }}>{it.l}</span>
          </button>
        );
      })}
    </div>
  );
}

/* styles */
const label = { fontSize: 11, letterSpacing: 1.4, color: T.sub, fontFamily: MONO, fontWeight: 500 };
const iconBtn = { width: 36, height: 36, borderRadius: 11, border: "none", background: "transparent",
  display: "grid", placeItems: "center", cursor: "pointer" };
const quickBtn = { display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 4px",
  borderRadius: 15, border: `1px solid ${T.line}`, background: T.card, cursor: "pointer" };
const pill = { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 11,
  border: "none", background: `linear-gradient(135deg, ${T.cyan}, ${T.cyanDim})`, color: "#04222a",
  fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: FONT };
const chip = { padding: "6px 11px", borderRadius: 9, border: `1px solid ${T.line}`, fontSize: 12,
  fontWeight: 600, cursor: "pointer", fontFamily: FONT };
const input = { width: "100%", background: "#0a2731", border: `1px solid ${T.line}`, borderRadius: 11,
  padding: "12px 14px", color: T.text, fontSize: 14, outline: "none", fontFamily: FONT, boxSizing: "border-box" };
const planCard = (on) => ({ position: "relative", padding: "14px 12px", borderRadius: 15, cursor: "pointer",
  textAlign: "left", background: on ? `${T.cyan}18` : T.card, border: on ? `1.5px solid ${T.cyan}` : `1px solid ${T.line}`,
  color: T.text });
