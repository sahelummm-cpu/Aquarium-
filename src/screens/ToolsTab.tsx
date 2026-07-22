import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import {
  BookOpen,
  Droplet,
  Timer,
  Beaker,
  Crown,
  ChevronRight,
  Search,
  Plus,
  X,
  Fish,
  Leaf,
  Waves,
  Thermometer,
  FlaskConical,
  Trash2,
} from "lucide-react-native";
import { T, FONT, MONO, CYAN_GRAD } from "../theme";
import { Card, Label, Pill, Chip, Input, Tag, ToolHeader } from "../ui";
import { Tank, Species, TimerItem, FISH_DB, gradFor, uid } from "../data";

type ToolView = "menu" | "database" | "dosing" | "wc" | "timers";

const TILES: { id: ToolView; icon: React.ReactNode; t: string; s: string; free: boolean }[] = [
  { id: "database", icon: <BookOpen size={20} color={T.cyan} />, t: "Livestock Database", s: "Fish, coral, plants & inverts — add your own", free: true },
  { id: "wc", icon: <Droplet size={20} color={T.cyan} />, t: "Water-Change Calculator", s: "Volume & dilution for any tank", free: true },
  { id: "timers", icon: <Timer size={20} color={T.cyan} />, t: "Test Timers", s: "Multiple stopwatches for water tests", free: true },
  { id: "dosing", icon: <Beaker size={20} color={T.cyan} />, t: "Dosing Calculator", s: "Ca, Alk, Mg & fertilizer dosing", free: false },
];

export function ToolsTab({
  tank,
  updateTank,
  premium,
  onUpgrade,
  customFish,
  setCustomFish,
  timers,
  setTimers,
}: {
  tank: Tank;
  updateTank: (id: string, patch: Partial<Tank>) => void;
  premium: boolean;
  onUpgrade: () => void;
  customFish: Species[];
  setCustomFish: (next: Species[]) => void;
  timers: TimerItem[];
  setTimers: React.Dispatch<React.SetStateAction<TimerItem[]>>;
}) {
  const [view, setView] = useState<ToolView>("menu");
  const back = () => setView("menu");

  if (view === "database")
    return <Database tank={tank} updateTank={updateTank} customFish={customFish} setCustomFish={setCustomFish} back={back} />;
  if (view === "dosing") return <DosingCalc tank={tank} back={back} />;
  if (view === "wc") return <WaterChangeCalc tank={tank} back={back} />;
  if (view === "timers") return <Timers timers={timers} setTimers={setTimers} back={back} />;

  return (
    <View>
      <Label style={styles.menuLabel}>AQUARIST TOOLS</Label>
      {TILES.map((tl) => (
        <Pressable
          key={tl.id}
          onPress={() => (tl.free || premium ? setView(tl.id) : onUpgrade())}
          style={styles.tile}
        >
          <View style={styles.tileIcon}>{tl.icon}</View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tileTitle}>{tl.t}</Text>
            <Text style={styles.tileSub}>{tl.s}</Text>
          </View>
          {!tl.free && !premium && <Crown size={16} color={T.gold} />}
          <ChevronRight size={18} color={T.sub} />
        </Pressable>
      ))}
    </View>
  );
}

/* ---- Livestock database ---- */
const KINDS = ["All", "Fish", "Invert", "Coral", "Plant"];

function Database({
  tank,
  updateTank,
  customFish,
  setCustomFish,
  back,
}: {
  tank: Tank;
  updateTank: (id: string, patch: Partial<Tank>) => void;
  customFish: Species[];
  setCustomFish: (next: Species[]) => void;
  back: () => void;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Species | null>(null);
  const [nf, setNf] = useState<{ name: string; kind: Species["kind"]; water: Species["water"]; care: Species["care"]; note: string }>({
    name: "",
    kind: "Fish",
    water: "Fresh",
    care: "Easy",
    note: "",
  });

  const all = [...customFish, ...FISH_DB];
  const results = all.filter(
    (f) =>
      (filter === "All" || f.kind === filter) &&
      (f.name.toLowerCase().includes(q.toLowerCase()) || (f.sci || "").toLowerCase().includes(q.toLowerCase()))
  );

  const kindIcon = (kind: string, size: number, color: string) =>
    kind === "Fish" ? <Fish size={size} color={color} /> : kind === "Plant" ? <Leaf size={size} color={color} /> : <Waves size={size} color={color} />;

  const addToTank = (f: Species) => {
    const existing = tank.livestock.find((l) => l.name === f.name);
    if (existing)
      updateTank(tank.id, {
        livestock: tank.livestock.map((l) => (l.name === f.name ? { ...l, qty: (l.qty || 1) + 1 } : l)),
      });
    else updateTank(tank.id, { livestock: [...tank.livestock, { id: uid(), name: f.name, qty: 1, kind: f.kind }] });
  };
  const saveNew = () => {
    if (!nf.name.trim()) return;
    setCustomFish([
      { id: uid(), ...nf, name: nf.name.trim(), custom: true, sci: "", temp: "—", ph: "—", min: 0 },
      ...customFish,
    ]);
    setNf({ name: "", kind: "Fish", water: "Fresh", care: "Easy", note: "" });
    setAdding(false);
  };

  const careColor = (care: string) => (care === "Easy" ? T.good : care === "Hard" ? T.danger : T.gold);

  if (detail) {
    const f = detail;
    return (
      <View>
        <ToolHeader title="Species" onBack={() => setDetail(null)} />
        <LinearGradient colors={gradFor(f.kind)} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.hero}>
          {kindIcon(f.kind, 64, "#ffffff55")}
        </LinearGradient>
        <Text style={styles.speciesName}>{f.name}</Text>
        {!!f.sci && <Text style={styles.speciesSci}>{f.sci}</Text>}
        <View style={styles.detailActions}>
          <Pill label={`Add to ${tank.name}`} icon={<Plus size={14} color={T.ink} />} onPress={() => addToTank(f)} style={{ paddingHorizontal: 14, paddingVertical: 9 }} />
        </View>
        <View style={styles.tagRow}>
          <Tag>{f.kind}</Tag>
          <Tag>{f.water}water</Tag>
          <Tag color={careColor(f.care)}>Care: {f.care}</Tag>
        </View>
        {f.min > 0 && (
          <Card>
            <Label>REQUIREMENTS</Label>
            <View style={styles.reqRow}>
              <ReqCol icon={<Thermometer size={15} color={T.coral} />} label="Temp" val={f.temp} />
              <ReqCol icon={<FlaskConical size={15} color={T.cyan} />} label="pH" val={f.ph} />
              <ReqCol icon={<Droplet size={15} color={T.cyan} />} label="Min tank" val={`${f.min} gal`} />
            </View>
          </Card>
        )}
        {!!f.note && (
          <Card>
            <Label>ABOUT</Label>
            <Text style={styles.aboutText}>{f.note}</Text>
          </Card>
        )}
      </View>
    );
  }

  return (
    <View>
      <ToolHeader title="Livestock Database" onBack={back} />
      <View style={styles.searchBar}>
        <Search size={16} color={T.sub} />
        <Input value={q} onChangeText={setQ} placeholder="Search species…" style={styles.searchInput} />
        <Chip label="Add" active icon={<Plus size={13} color={T.ink} />} onPress={() => setAdding(true)} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {KINDS.map((k) => (
          <Chip key={k} label={k} active={filter === k} onPress={() => setFilter(k)} />
        ))}
      </ScrollView>

      {adding && (
        <Card>
          <Label>ADD YOUR OWN SPECIES</Label>
          <Input autoFocus value={nf.name} onChangeText={(v) => setNf({ ...nf, name: v })} placeholder="Species name" style={{ marginTop: 10 }} />
          <View style={styles.kindRow}>
            {(["Fish", "Invert", "Coral", "Plant"] as Species["kind"][]).map((k) => (
              <Chip key={k} label={k} active={nf.kind === k} onPress={() => setNf({ ...nf, kind: k })} />
            ))}
          </View>
          <Input value={nf.note} onChangeText={(v) => setNf({ ...nf, note: v })} placeholder="Care notes (optional)" style={{ marginTop: 10 }} />
          <View style={styles.formActions}>
            <Pill label="Save species" onPress={saveNew} style={{ flex: 1, paddingVertical: 10 }} />
            <Pressable onPress={() => setAdding(false)} style={styles.closeBtn}>
              <X size={16} color={T.sub} />
            </Pressable>
          </View>
        </Card>
      )}

      {results.map((f) => (
        <Card key={f.id}>
          <Pressable onPress={() => setDetail(f)} style={styles.resultRow}>
            <LinearGradient colors={gradFor(f.kind)} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.resultAvatar}>
              {kindIcon(f.kind, 20, "#ffffff88")}
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <View style={styles.resultTitleRow}>
                <Text style={styles.resultName}>{f.name}</Text>
                {f.custom && (
                  <View style={styles.yoursBadge}>
                    <Text style={styles.yoursText}>YOURS</Text>
                  </View>
                )}
              </View>
              {!!f.sci && <Text style={styles.resultSci}>{f.sci}</Text>}
              <View style={styles.resultTags}>
                <Tag>{f.kind}</Tag>
                <Tag color={careColor(f.care)}>{f.care}</Tag>
              </View>
            </View>
            <ChevronRight size={18} color={T.sub} />
          </Pressable>
          <Pill
            label={`Add to ${tank.name}`}
            icon={<Plus size={13} color={T.ink} />}
            onPress={() => addToTank(f)}
            style={{ marginTop: 10, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 7 }}
          />
        </Card>
      ))}
      {results.length === 0 && <Text style={styles.noMatch}>No match. Tap “Add” to create this species.</Text>}
    </View>
  );
}

function ReqCol({ icon, label, val }: { icon: React.ReactNode; label: string; val: string }) {
  return (
    <View style={styles.reqCol}>
      <View style={{ marginBottom: 5 }}>{icon}</View>
      <Text style={styles.reqLabel}>{label}</Text>
      <Text style={styles.reqVal}>{val}</Text>
    </View>
  );
}

/* ---- Water-change calculator ---- */
function WaterChangeCalc({ tank, back }: { tank: Tank; back: () => void }) {
  const [pct, setPct] = useState(25);
  const gal = (tank.volume * pct) / 100;
  return (
    <View>
      <ToolHeader title="Water-Change Calculator" onBack={back} />
      <Card>
        <Label>
          {tank.name} · {tank.volume} GALLONS
        </Label>
        <Text style={styles.wcHint}>Change percentage</Text>
        <View style={styles.wcChips}>
          {[10, 20, 25, 30, 50].map((n) => (
            <Chip key={n} label={`${n}%`} active={pct === n} onPress={() => setPct(n)} />
          ))}
        </View>
        <Slider
          style={{ width: "100%", marginTop: 16 }}
          minimumValue={5}
          maximumValue={90}
          step={1}
          value={pct}
          onValueChange={(v) => setPct(Math.round(v))}
          minimumTrackTintColor={T.cyan}
          maximumTrackTintColor={T.line}
          thumbTintColor={T.cyan}
        />
        <View style={styles.wcResult}>
          <Text style={styles.wcBig}>{gal.toFixed(1)}</Text>
          <Text style={styles.wcSub}>gallons to replace ({pct}%)</Text>
          <Text style={styles.wcLiters}>≈ {(gal * 3.785).toFixed(1)} liters</Text>
        </View>
      </Card>
      <Text style={styles.tip}>
        Match new water temperature and salinity before adding. For saltwater, mix and aerate RODI water 24h ahead.
      </Text>
    </View>
  );
}

/* ---- Dosing calculator ---- */
const SUPPS: Record<string, { unit: string; factor: number; name: string }> = {
  Alkalinity: { unit: "dKH", factor: 0.14, name: "2-part Alk" },
  Calcium: { unit: "ppm", factor: 0.008, name: "2-part Ca" },
  Magnesium: { unit: "ppm", factor: 0.006, name: "Mg supplement" },
};

function DosingCalc({ tank, back }: { tank: Tank; back: () => void }) {
  const [supp, setSupp] = useState("Alkalinity");
  const [cur, setCur] = useState("");
  const [target, setTarget] = useState("");
  const s = SUPPS[supp];
  const diff = Number(target) - Number(cur);
  const dose = cur && target && diff > 0 ? (diff * s.factor * tank.volume).toFixed(1) : null;
  return (
    <View>
      <ToolHeader title="Dosing Calculator" onBack={back} />
      <View style={styles.suppRow}>
        {Object.keys(SUPPS).map((k) => (
          <Chip key={k} label={k} active={supp === k} onPress={() => setSupp(k)} style={{ flex: 1, justifyContent: "center" }} />
        ))}
      </View>
      <Card>
        <Label>CURRENT & TARGET ({s.unit})</Label>
        <View style={styles.dosingInputs}>
          <Input value={cur} onChangeText={setCur} numeric placeholder="Current" style={{ flex: 1, width: undefined }} />
          <Input value={target} onChangeText={setTarget} numeric placeholder="Target" style={{ flex: 1, width: undefined }} />
        </View>
        <View style={styles.dosingResult}>
          {dose ? (
            <>
              <Text style={styles.dosingBig}>{dose} ml</Text>
              <Text style={styles.wcSub}>
                of {s.name} for {tank.volume} gal
              </Text>
              <Text style={styles.dosingWarn}>Dose gradually — raise no more than 1 {s.unit}/day.</Text>
            </>
          ) : (
            <Text style={styles.dosingEmpty}>
              {diff < 0 ? "Target is below current — no dose needed." : "Enter current and target values."}
            </Text>
          )}
        </View>
      </Card>
      <Text style={styles.tip}>
        Estimates only. Always verify with a test kit before and after dosing. Product concentrations vary by brand.
      </Text>
    </View>
  );
}

/* ---- Test timers (timestamp-based, state lifted to the app root) ---- */
const remaining = (t: TimerItem) =>
  t.running && t.endsAt != null ? Math.max(0, Math.round((t.endsAt - Date.now()) / 1000)) : t.leftWhenPaused;

function Timers({
  timers,
  setTimers,
  back,
}: {
  timers: TimerItem[];
  setTimers: React.Dispatch<React.SetStateAction<TimerItem[]>>;
  back: () => void;
}) {
  const [, setTick] = useState(0);

  // Re-render once a second while the screen is mounted; the actual
  // countdown is derived from each timer's `endsAt` timestamp.
  useEffect(() => {
    const iv = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const add = () =>
    setTimers((ts) => [...ts, { id: uid(), label: "New test", sec: 180, running: false, endsAt: null, leftWhenPaused: 180 }]);
  const toggle = (id: string) =>
    setTimers((ts) =>
      ts.map((t) => {
        if (t.id !== id) return t;
        if (t.running) {
          return { ...t, running: false, leftWhenPaused: remaining(t), endsAt: null };
        }
        const left = t.leftWhenPaused > 0 ? t.leftWhenPaused : t.sec;
        return { ...t, running: true, endsAt: Date.now() + left * 1000, leftWhenPaused: left };
      })
    );
  const reset = (id: string) =>
    setTimers((ts) => ts.map((t) => (t.id === id ? { ...t, running: false, endsAt: null, leftWhenPaused: t.sec } : t)));
  const remove = (id: string) => setTimers((ts) => ts.filter((t) => t.id !== id));
  const setDur = (id: string, sec: number) =>
    setTimers((ts) => ts.map((t) => (t.id === id ? { ...t, sec, running: false, endsAt: null, leftWhenPaused: sec } : t)));
  const setLabel = (id: string, label: string) => setTimers((ts) => ts.map((t) => (t.id === id ? { ...t, label } : t)));

  return (
    <View>
      <ToolHeader title="Test Timers" onBack={back} />
      {timers.map((t) => {
        const left = remaining(t);
        return (
          <Card key={t.id}>
            <View style={styles.timerHead}>
              <Input value={t.label} onChangeText={(v) => setLabel(t.id, v)} style={styles.timerLabel} />
              <Pressable onPress={() => remove(t.id)} accessibilityRole="button" accessibilityLabel="Delete timer" style={styles.closeBtn}>
                <Trash2 size={15} color={T.danger} />
              </Pressable>
            </View>
            <Text style={[styles.timerTime, { color: left === 0 ? T.coral : t.running ? T.cyan : T.text }]}>{fmt(left)}</Text>
            <View style={styles.timerDurs}>
              {[60, 180, 300, 600].map((d) => (
                <Chip key={d} label={`${d / 60}m`} active={t.sec === d} onPress={() => setDur(t.id, d)} />
              ))}
            </View>
            <View style={styles.timerActions}>
              <Pill label={t.running ? "Pause" : "Start"} onPress={() => toggle(t.id)} style={{ flex: 1, paddingVertical: 10 }} />
              <Pill label="Reset" variant="outline" onPress={() => reset(t.id)} style={{ paddingHorizontal: 16 }} />
            </View>
          </Card>
        );
      })}
      <Pill variant="dashed" label="Add timer" icon={<Plus size={15} color={T.cyan} />} onPress={add} style={{ paddingVertical: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  menuLabel: { marginHorizontal: 4, marginTop: 6, marginBottom: 10 },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 10,
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 16,
    padding: 15,
  },
  tileIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: T.cyan + "18", alignItems: "center", justifyContent: "center" },
  tileTitle: { fontSize: 15, fontWeight: "600", color: T.text, fontFamily: FONT },
  tileSub: { fontSize: 12, color: T.sub, marginTop: 2, fontFamily: FONT },

  hero: { height: 210, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 14, overflow: "hidden" },
  speciesName: { fontSize: 22, fontWeight: "700", color: T.text, fontFamily: FONT },
  speciesSci: { fontSize: 14, color: T.sub, fontStyle: "italic", marginTop: 2, fontFamily: FONT },
  detailActions: { flexDirection: "row", gap: 14, marginTop: 12 },
  tagRow: { flexDirection: "row", gap: 7, marginTop: 14, flexWrap: "wrap" },
  reqRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  reqCol: { alignItems: "center", flex: 1 },
  reqLabel: { fontSize: 10, color: T.sub, fontFamily: MONO },
  reqVal: { fontSize: 13, fontWeight: "600", marginTop: 2, color: T.text, fontFamily: FONT },
  aboutText: { fontSize: 14, lineHeight: 22, color: T.text, marginTop: 8, fontFamily: FONT },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0a2731",
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: { flex: 1, width: undefined, backgroundColor: "transparent", borderWidth: 0, paddingVertical: 6, paddingHorizontal: 0 },
  filterRow: { gap: 7, marginBottom: 10 },
  kindRow: { flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap" },
  formActions: { flexDirection: "row", gap: 8, marginTop: 12, alignItems: "center" },
  closeBtn: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center" },

  resultRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  resultAvatar: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  resultTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  resultName: { fontSize: 15, fontWeight: "700", color: T.text, fontFamily: FONT },
  resultSci: { fontSize: 12, color: T.sub, fontStyle: "italic", fontFamily: FONT },
  resultTags: { flexDirection: "row", gap: 6, marginTop: 5, flexWrap: "wrap" },
  yoursBadge: { borderWidth: 1, borderColor: T.gold + "55", paddingVertical: 1, paddingHorizontal: 5, borderRadius: 5 },
  yoursText: { fontSize: 9, color: T.gold, fontFamily: FONT },
  noMatch: { color: T.sub, fontSize: 13, padding: 12, textAlign: "center", fontFamily: FONT },

  wcHint: { fontSize: 13, color: T.sub, marginTop: 14, marginBottom: 8, fontFamily: FONT },
  wcChips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  wcResult: { alignItems: "center", marginTop: 18 },
  wcBig: { fontSize: 46, fontWeight: "700", color: T.cyan, fontFamily: FONT },
  wcSub: { fontSize: 13, color: T.sub, fontFamily: FONT },
  wcLiters: { fontSize: 12, color: T.sub, fontFamily: MONO, marginTop: 6 },
  tip: { fontSize: 12, color: T.sub, paddingHorizontal: 6, lineHeight: 18, fontFamily: FONT },

  suppRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  dosingInputs: { flexDirection: "row", gap: 10, marginTop: 10 },
  dosingResult: { alignItems: "center", marginTop: 20 },
  dosingBig: { fontSize: 42, fontWeight: "700", color: T.cyan, fontFamily: FONT },
  dosingWarn: { fontSize: 11, color: T.gold, marginTop: 8, fontFamily: FONT, textAlign: "center" },
  dosingEmpty: { fontSize: 13, color: T.sub, padding: 10, textAlign: "center", fontFamily: FONT },

  timerHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timerLabel: { flex: 1, width: undefined, backgroundColor: "transparent", borderWidth: 0, paddingVertical: 0, paddingHorizontal: 0, fontWeight: "600" },
  timerTime: { fontSize: 44, fontWeight: "700", fontFamily: MONO, textAlign: "center", marginVertical: 6 },
  timerDurs: { flexDirection: "row", gap: 6, justifyContent: "center", marginBottom: 10 },
  timerActions: { flexDirection: "row", gap: 8 },
});
