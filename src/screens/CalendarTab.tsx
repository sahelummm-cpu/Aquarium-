import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, ChevronRight, Plus, BellRing, Bell, Trash2, X, Check } from "lucide-react-native";
import { T, FONT, MONO, CYAN_GRAD } from "../theme";
import { Card, Label, Pill, Chip, Input, IconButton } from "../ui";
import { Tank, todayKey, uid } from "../data";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const GRID_GAP = 4;

export function CalendarTab({
  tank,
  updateTank,
}: {
  tank: Tank;
  updateTank: (id: string, patch: Partial<Tank>) => void;
}) {
  const [month, setMonth] = useState(new Date());
  const [sel, setSel] = useState(todayKey());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<{ title: string; every: number; priority: string }>({
    title: "",
    every: 7,
    priority: "normal",
  });
  const [cell, setCell] = useState(40);

  const y = month.getFullYear();
  const m = month.getMonth();
  const firstDow = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const key = (d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const logsOn = (d: number) =>
    tank.logs.filter((l) => l.date === key(d)).length +
    tank.tasks.filter((t) => t.next === key(d) && !t.done).length;

  const selLogs = tank.logs.filter((l) => l.date === sel);
  const selTasks = tank.tasks.filter((t) => t.next === sel && !t.done);

  const onGridLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    // Floor so 7 cells + 6 gaps never exceed the row width (a fractional
    // overflow would wrap the 7th day and break the month grid).
    setCell(Math.floor((w - GRID_GAP * 6) / 7));
  };

  const addTask = () => {
    if (!form.title.trim()) return;
    updateTank(tank.id, {
      tasks: [
        ...tank.tasks,
        {
          id: uid(),
          title: form.title.trim(),
          every: Number(form.every),
          next: sel,
          priority: form.priority,
          done: false,
        },
      ],
    });
    setForm({ title: "", every: 7, priority: "normal" });
    setAdding(false);
  };
  const removeTask = (id: string) => updateTank(tank.id, { tasks: tank.tasks.filter((t) => t.id !== id) });

  return (
    <View>
      <Card>
        <View style={styles.monthRow}>
          <IconButton onPress={() => setMonth(new Date(y, m - 1, 1))}>
            <ChevronLeft size={18} color={T.text} />
          </IconButton>
          <Text style={styles.monthLabel}>
            {month.toLocaleString("en", { month: "long", year: "numeric" })}
          </Text>
          <IconButton onPress={() => setMonth(new Date(y, m + 1, 1))}>
            <ChevronRight size={18} color={T.text} />
          </IconButton>
        </View>

        <View style={styles.grid} onLayout={onGridLayout}>
          {WEEKDAYS.map((d, i) => (
            <View key={`h${i}`} style={{ width: cell, alignItems: "center" }}>
              <Text style={styles.weekday}>{d}</Text>
            </View>
          ))}
          {cells.map((d, i) => {
            if (!d) return <View key={i} style={{ width: cell, height: cell }} />;
            const k = key(d);
            const isSel = k === sel;
            const isToday = k === todayKey();
            const n = logsOn(d);
            const dayInner = (
              <>
                <Text style={[styles.dayNum, { color: isSel ? T.ink : T.text }]}>{d}</Text>
                {n > 0 && <View style={[styles.dot, { backgroundColor: isSel ? T.ink : T.coral }]} />}
              </>
            );
            return (
              <Pressable key={i} onPress={() => setSel(k)} style={{ width: cell, height: cell }}>
                {isSel ? (
                  <LinearGradient
                    colors={CYAN_GRAD}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.dayCell}
                  >
                    {dayInner}
                  </LinearGradient>
                ) : (
                  <View style={[styles.dayCell, isToday && { borderWidth: 1, borderColor: T.cyan }]}>
                    {dayInner}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </Card>

      <View style={styles.selRow}>
        <Label>{sel}</Label>
        <Pill label="Schedule" icon={<Plus size={13} color={T.ink} />} onPress={() => setAdding(true)} />
      </View>

      {adding && (
        <Card>
          <Input autoFocus value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="Task name" />
          <View style={styles.repeatRow}>
            <Text style={styles.formHint}>Repeat every</Text>
            {[1, 3, 7, 14, 30].map((n) => (
              <Chip key={n} label={`${n}d`} active={form.every === n} onPress={() => setForm({ ...form, every: n })} />
            ))}
          </View>
          <View style={styles.priorityRow}>
            <Text style={styles.formHint}>Priority</Text>
            <Chip label="Normal" active={form.priority === "normal"} onPress={() => setForm({ ...form, priority: "normal" })} />
            <Chip
              label="Time-sensitive"
              active={form.priority === "timeSensitive"}
              activeColor={T.coral}
              icon={<BellRing size={11} color={form.priority === "timeSensitive" ? T.ink : T.text} />}
              onPress={() => setForm({ ...form, priority: "timeSensitive" })}
            />
          </View>
          <View style={styles.formActions}>
            <Pill label="Add task" onPress={addTask} style={{ flex: 1, paddingVertical: 10 }} />
            <IconButton onPress={() => setAdding(false)} style={{ width: 40 }}>
              <X size={16} color={T.sub} />
            </IconButton>
          </View>
        </Card>
      )}

      {selTasks.map((t) => (
        <Card key={t.id}>
          <View style={styles.taskRow}>
            <Bell size={16} color={t.priority === "timeSensitive" ? T.coral : T.cyan} />
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{t.title}</Text>
              <Text style={styles.taskMeta}>
                every {t.every}d {t.priority === "timeSensitive" ? "· time-sensitive" : ""}
              </Text>
            </View>
            <IconButton onPress={() => removeTask(t.id)}>
              <Trash2 size={15} color={T.danger} />
            </IconButton>
          </View>
        </Card>
      ))}

      {selLogs.map((l) => (
        <View key={l.id} style={styles.logRow}>
          <Check size={15} color={T.good} style={{ marginTop: 3 }} />
          <View>
            <Text style={styles.taskTitle}>{l.type}</Text>
            {!!l.note && <Text style={styles.taskMeta}>{l.note}</Text>}
          </View>
        </View>
      ))}

      {selTasks.length === 0 && selLogs.length === 0 && !adding && (
        <Text style={styles.empty}>Nothing scheduled. Tap Schedule to add a recurring task.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  monthLabel: { fontWeight: "700", fontSize: 16, color: T.text, fontFamily: FONT },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP },
  weekday: { textAlign: "center", fontSize: 10, color: T.sub, fontFamily: MONO },
  dayCell: { flex: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  dayNum: { fontSize: 13, fontWeight: "600", fontFamily: FONT },
  dot: { position: "absolute", bottom: 4, width: 5, height: 5, borderRadius: 3 },
  selRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 4, marginTop: 4, marginBottom: 8 },
  repeatRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10, alignItems: "center" },
  priorityRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12, alignItems: "center" },
  formHint: { fontSize: 12, color: T.sub, fontFamily: FONT },
  formActions: { flexDirection: "row", gap: 8, marginTop: 14, alignItems: "center" },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  taskTitle: { fontWeight: "600", fontSize: 14, color: T.text, fontFamily: FONT },
  taskMeta: { fontSize: 11, color: T.sub, fontFamily: MONO },
  logRow: { flexDirection: "row", gap: 11, paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: T.line },
  empty: { color: T.sub, fontSize: 13, paddingHorizontal: 4, paddingVertical: 8, fontFamily: FONT },
});
