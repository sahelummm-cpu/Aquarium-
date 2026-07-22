import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Waves,
  Timer,
  Thermometer,
  FlaskConical,
  Heart,
  Fish,
  Leaf,
  Activity,
  Droplet,
  Sparkles,
  BellRing,
  Check,
  StickyNote,
} from "lucide-react-native";
import { T, FONT, MONO, CYAN_GRAD } from "../theme";
import { Card, Label, Pill, Stat, IconButton, Input } from "../ui";
import { Tank, healthScore, daysBetween, todayKey, uid } from "../data";

/* Glanceable widget — mirrors what a home / lock-screen widget shows. */
function GlanceWidget({ tank }: { tank: Tank }) {
  const health = healthScore(tank);
  const upcoming = [...tank.tasks]
    .filter((t) => !t.done)
    .sort((a, b) => new Date(a.next).getTime() - new Date(b.next).getTime())[0];
  const nextIn = upcoming ? daysBetween(todayKey(), upcoming.next) : null;
  const latest = (id: string) => {
    const a = tank.measures?.[id];
    return a && a.length ? a[a.length - 1].v : null;
  };
  const temp = latest("temp");
  const ph = latest("ph");
  const dueLabel =
    nextIn == null ? "All clear" : nextIn <= 0 ? "Due now" : nextIn === 1 ? "in 1 day" : `in ${nextIn} days`;
  const scoreColor = health.score >= 80 ? T.good : health.score >= 55 ? T.gold : T.danger;

  return (
    <View style={styles.widget}>
      <LinearGradient
        colors={["rgba(63,224,208,0.14)", "rgba(6,19,25,0.6)"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.widgetHead}>
        <View style={styles.widgetBrand}>
          <LinearGradient colors={CYAN_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.widgetLogo}>
            <Waves size={14} color={T.ink} strokeWidth={2.4} />
          </LinearGradient>
          <Text style={styles.widgetTank}>{tank.name}</Text>
        </View>
        <Text style={styles.widgetBadge}>WIDGET</Text>
      </View>

      <View style={styles.widgetScoreRow}>
        <Text style={[styles.widgetScore, { color: scoreColor }]}>{health.score}</Text>
        <Text style={styles.widgetScoreSub}>health</Text>
      </View>

      <View style={styles.widgetChips}>
        <WChip icon={<Timer size={13} color={nextIn != null && nextIn <= 0 ? T.coral : T.cyan} />} label="Next task" value={dueLabel} />
        <WChip icon={<Thermometer size={13} color={T.coral} />} label="Temp" value={temp != null ? `${temp}°` : "—"} />
        <WChip icon={<FlaskConical size={13} color={T.cyan} />} label="pH" value={ph != null ? `${ph}` : "—"} />
      </View>
    </View>
  );
}

function WChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.wchip}>
      <View style={styles.wchipHead}>
        {icon}
        <Text style={styles.wchipLabel}>{label}</Text>
      </View>
      <Text style={styles.wchipValue}>{value}</Text>
    </View>
  );
}

function AdSlot({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <View style={styles.ad}>
      <View style={styles.adIcon}>
        <FlaskConical size={18} color={T.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.adKicker}>SPONSORED · AQUARIUM GEAR</Text>
        <Text style={styles.adTitle}>Premium reef test kits</Text>
      </View>
      <Pill label="Remove" variant="outline" onPress={onUpgrade} textStyle={{ fontSize: 11 }} />
    </View>
  );
}

const QUICK = [
  { t: "Water change", icon: (c: string) => <Droplet size={18} color={c} /> },
  { t: "Feed", icon: (c: string) => <Fish size={18} color={c} /> },
  { t: "Dose", icon: (c: string) => <FlaskConical size={18} color={c} /> },
  { t: "Clean", icon: (c: string) => <Sparkles size={18} color={c} /> },
];

export function HomeTab({
  tank,
  updateTank,
  showAds,
  onUpgrade,
}: {
  tank: Tank;
  updateTank: (id: string, patch: Partial<Tank>) => void;
  showAds: boolean;
  onUpgrade: () => void;
}) {
  const [quickNote, setQuickNote] = useState("");
  const health = healthScore(tank);
  const dueTasks = tank.tasks.filter((t) => !t.done && daysBetween(todayKey(), t.next) <= 0);
  const scoreColor = health.score >= 80 ? T.good : health.score >= 55 ? T.gold : T.danger;
  const fishCount = tank.livestock.reduce((a, l) => a + (l.qty || 1), 0);

  const logAction = (type: string) => {
    const entry = { id: uid(), date: todayKey(), type, note: "", photo: null };
    updateTank(tank.id, { logs: [entry, ...tank.logs] });
  };
  const completeTask = (id: string) => {
    const done = tank.tasks.find((t) => t.id === id);
    updateTank(tank.id, {
      tasks: tank.tasks.map((t) =>
        t.id === id
          ? { ...t, next: new Date(Date.now() + t.every * 86400000).toISOString().slice(0, 10) }
          : t
      ),
      logs: [{ id: uid(), date: todayKey(), type: done ? done.title : "Task", note: "", photo: null }, ...tank.logs],
    });
  };
  const saveNote = () => {
    if (!quickNote.trim()) return;
    updateTank(tank.id, {
      logs: [{ id: uid(), date: todayKey(), type: "Note", note: quickNote.trim(), photo: null }, ...tank.logs],
    });
    setQuickNote("");
  };

  return (
    <View>
      <GlanceWidget tank={tank} />

      {/* health dashboard */}
      <Card>
        <View style={styles.healthTop}>
          <View>
            <Label>TANK HEALTH</Label>
            <Text style={[styles.healthScore, { color: scoreColor }]}>
              {health.score}
              <Text style={styles.healthOutOf}> / 100</Text>
            </Text>
          </View>
          <Heart size={22} color={T.coral} fill={T.coral} />
        </View>
        <View style={styles.healthBar}>
          <LinearGradient
            colors={[T.cyan, T.good]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${health.score}%` as `${number}%`, height: "100%" }}
          />
        </View>
        {health.flags.length > 0 && <Text style={styles.healthFlag}>{health.flags[0]}</Text>}
        <View style={styles.healthStats}>
          <Stat label="Livestock" value={fishCount} icon={<Fish size={13} color={T.sub} />} />
          <Stat label="Species" value={tank.livestock.length} icon={<Leaf size={13} color={T.sub} />} />
          <Stat label="Logs" value={tank.logs.length} icon={<Activity size={13} color={T.sub} />} />
        </View>
      </Card>

      {/* due tasks */}
      {dueTasks.length > 0 && (
        <Card>
          <Label>DUE TODAY</Label>
          {dueTasks.map((t) => (
            <View key={t.id} style={styles.dueRow}>
              <IconButton onPress={() => completeTask(t.id)} style={styles.checkBtn}>
                <Check size={15} color={T.cyan} />
              </IconButton>
              <View style={{ flex: 1 }}>
                <Text style={styles.dueTitle}>{t.title}</Text>
                <Text style={styles.dueEvery}>every {t.every}d</Text>
              </View>
              {t.priority === "timeSensitive" && (
                <View style={styles.tsBadge}>
                  <BellRing size={10} color={T.coral} />
                  <Text style={styles.tsText}>Time-sensitive</Text>
                </View>
              )}
            </View>
          ))}
        </Card>
      )}

      {/* quick actions */}
      <View style={styles.quickGrid}>
        {QUICK.map((a) => (
          <Pressable key={a.t} onPress={() => logAction(a.t)} style={styles.quickBtn}>
            {a.icon(T.cyan)}
            <Text style={styles.quickLabel}>{a.t}</Text>
          </Pressable>
        ))}
      </View>

      {/* quick note */}
      <Card>
        <View style={styles.noteRow}>
          <StickyNote size={16} color={T.sub} />
          <Input
            value={quickNote}
            onChangeText={setQuickNote}
            placeholder="Add a note for today…"
            maxLength={280}
            style={styles.noteInput}
          />
          <Pill label="Save" onPress={saveNote} disabled={!quickNote.trim()} />
        </View>
      </Card>

      {showAds && <AdSlot onUpgrade={onUpgrade} />}

      {/* activity feed */}
      <Label style={styles.feedLabel}>ACTIVITY FEED</Label>
      {tank.logs.length === 0 && (
        <Text style={styles.empty}>No activity yet. Tap a quick action above to log your first entry.</Text>
      )}
      {tank.logs.slice(0, 12).map((l) => (
        <View key={l.id} style={styles.feedRow}>
          <View style={styles.feedIcon}>
            <Activity size={15} color={T.cyan} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.feedType}>{l.type}</Text>
            {!!l.note && <Text style={styles.feedNote}>{l.note}</Text>}
            <Text style={styles.feedDate}>{l.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    position: "relative",
    borderRadius: 22,
    padding: 16,
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: T.cardSolid,
    borderWidth: 1,
    borderColor: T.line,
    overflow: "hidden",
  },
  widgetHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  widgetBrand: { flexDirection: "row", alignItems: "center", gap: 7 },
  widgetLogo: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  widgetTank: { fontSize: 13, fontWeight: "600", color: T.text, fontFamily: FONT },
  widgetBadge: {
    fontSize: 9.5,
    letterSpacing: 0.6,
    color: T.sub,
    fontFamily: MONO,
    borderWidth: 1,
    borderColor: T.line,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 7,
  },
  widgetScoreRow: { flexDirection: "row", alignItems: "flex-end", gap: 4, marginTop: 12 },
  widgetScore: { fontSize: 34, fontWeight: "700", fontFamily: FONT },
  widgetScoreSub: { fontSize: 12, color: T.sub, marginBottom: 4, fontFamily: FONT },
  widgetChips: { flexDirection: "row", gap: 8, marginTop: 12 },
  wchip: {
    flex: 1,
    backgroundColor: "rgba(6,19,25,0.45)",
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 13,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  wchipHead: { flexDirection: "row", alignItems: "center", gap: 5 },
  wchipLabel: { fontSize: 9.5, color: T.sub, letterSpacing: 0.3, fontFamily: FONT },
  wchipValue: { fontSize: 14, fontWeight: "600", marginTop: 4, color: T.text, fontFamily: FONT },

  healthTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  healthScore: { fontSize: 40, fontWeight: "700", marginTop: 4, fontFamily: FONT },
  healthOutOf: { fontSize: 16, color: T.sub, fontWeight: "400" },
  healthBar: { height: 8, borderRadius: 6, backgroundColor: "#0a2731", marginTop: 12, overflow: "hidden" },
  healthFlag: { marginTop: 10, fontSize: 12, color: T.gold, fontFamily: FONT },
  healthStats: { flexDirection: "row", gap: 16, marginTop: 14 },

  dueRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: T.line },
  checkBtn: { width: 30, height: 30, borderWidth: 1.5, borderColor: T.cyan, borderRadius: 9 },
  dueTitle: { fontWeight: "600", fontSize: 14, color: T.text, fontFamily: FONT },
  dueEvery: { fontSize: 11, color: T.sub, fontFamily: MONO },
  tsBadge: { flexDirection: "row", alignItems: "center", gap: 3, borderWidth: 1, borderColor: T.coral + "55", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 },
  tsText: { fontSize: 10, color: T.coral, fontFamily: FONT },

  quickGrid: { flexDirection: "row", gap: 8, marginTop: 4, marginBottom: 12 },
  quickBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: T.line,
    backgroundColor: T.card,
  },
  quickLabel: { fontSize: 10.5, marginTop: 5, color: T.sub, fontFamily: FONT },

  noteRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  noteInput: { flex: 1, backgroundColor: "transparent", borderWidth: 0, paddingHorizontal: 0, paddingVertical: 0, width: undefined },

  ad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,209,102,0.08)",
    borderWidth: 1,
    borderColor: T.gold + "33",
    marginTop: 6,
    marginBottom: 12,
  },
  adIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: T.gold + "22", alignItems: "center", justifyContent: "center" },
  adKicker: { fontSize: 10, color: T.sub, fontFamily: MONO },
  adTitle: { fontSize: 13, fontWeight: "600", color: T.text, fontFamily: FONT },

  feedLabel: { marginHorizontal: 4, marginVertical: 6 },
  empty: { color: T.sub, fontSize: 13, paddingHorizontal: 4, paddingVertical: 8, fontFamily: FONT },
  feedRow: { flexDirection: "row", gap: 11, paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: T.line },
  feedIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: T.card, alignItems: "center", justifyContent: "center" },
  feedType: { fontSize: 14, fontWeight: "600", color: T.text, fontFamily: FONT },
  feedNote: { fontSize: 12.5, color: T.sub, marginTop: 2, fontFamily: FONT },
  feedDate: { fontSize: 11, color: T.sub, fontFamily: MONO, marginTop: 2 },
});
