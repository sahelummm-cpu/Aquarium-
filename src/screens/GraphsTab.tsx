import React, { useState } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent, Alert, ScrollView } from "react-native";
import Svg, { Rect, Line, Polyline, Circle } from "react-native-svg";
import { BarChart3, Trash2 } from "lucide-react-native";
import { T, FONT, MONO } from "../theme";
import { Card, Label, Pill, Chip, Input, IconButton } from "../ui";
import { Tank, PARAM_PRESETS, todayKey, uid } from "../data";

const VB_W = 300;
const VB_H = 130;

export function GraphsTab({
  tank,
  updateTank,
}: {
  tank: Tank;
  updateTank: (id: string, patch: Partial<Tank>) => void;
}) {
  const [selParam, setSelParam] = useState(PARAM_PRESETS[0].id);
  const [val, setVal] = useState("");
  const [thVal, setThVal] = useState("");
  const [chartW, setChartW] = useState(300);

  const p = PARAM_PRESETS.find((x) => x.id === selParam)!;
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
  const removeThreshold = (id: string) => {
    const next = { ...(tank.thresholds || {}) };
    next[selParam] = (next[selParam] || []).filter((t) => t.id !== id);
    updateTank(tank.id, { thresholds: next });
  };
  const exportCSV = () => {
    const rows: (string | number)[][] = [["param", "date", "value"]];
    PARAM_PRESETS.forEach((pp) => (tank.measures?.[pp.id] || []).forEach((mm) => rows.push([pp.name, mm.d, mm.v])));
    const csv = rows.map((r) => r.join(",")).join("\n");
    console.log("CSV EXPORT:\n" + csv);
    Alert.alert("Export ready", `Prepared ${rows.length - 1} measurements as CSV. In-app this saves a .csv file you can share.`);
  };

  const thVals = thresholds.map((t) => t.v);
  const vals = data.map((d) => d.v);
  const max = Math.max(...vals, ...thVals, p.hi || 1);
  const min = Math.min(...vals, ...thVals, p.lo || 0);
  const range = max - min || 1;
  const yFor = (v: number) => VB_H - ((v - min) / range) * 120 - 5;
  const chartH = (chartW * VB_H) / VB_W;

  const onChartLayout = (e: LayoutChangeEvent) => setChartW(e.nativeEvent.layout.width);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paramRow}>
        {PARAM_PRESETS.map((pp) => (
          <Chip key={pp.id} label={pp.name} active={pp.id === selParam} activeColor={pp.color} onPress={() => setSelParam(pp.id)} />
        ))}
      </ScrollView>

      <Card>
        <View style={styles.chartHead}>
          <Label>
            {p.name} {p.unit ? `(${p.unit})` : ""}
          </Label>
          <Text style={styles.latest}>
            latest {vals[vals.length - 1] ?? "—"}
            {p.unit}
          </Text>
        </View>

        <View style={{ width: "100%", marginTop: 10 }} onLayout={onChartLayout}>
          <Svg width={chartW} height={chartH} viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
            <Rect x={0} y={yFor(p.hi)} width={VB_W} height={Math.max(0, yFor(p.lo) - yFor(p.hi))} fill={p.color + "10"} />
            {thresholds.map((t) => (
              <Line key={t.id} x1={0} x2={VB_W} y1={yFor(t.v)} y2={yFor(t.v)} stroke={t.color} strokeWidth={1.5} strokeDasharray="5 4" />
            ))}
            {data.length > 1 && (
              <>
                <Polyline
                  fill={p.color + "18"}
                  stroke="none"
                  points={`0,125 ${data.map((d, i) => `${(i / (data.length - 1)) * VB_W},${yFor(d.v)}`).join(" ")} 300,125`}
                />
                <Polyline
                  fill="none"
                  stroke={p.color}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  points={data.map((d, i) => `${(i / (data.length - 1)) * VB_W},${yFor(d.v)}`).join(" ")}
                />
              </>
            )}
            {data.map((d, i) => (
              <Circle key={i} cx={data.length > 1 ? (i / (data.length - 1)) * VB_W : 150} cy={yFor(d.v)} r={3.5} fill={p.color} />
            ))}
          </Svg>
        </View>

        <View style={styles.axisRow}>
          <Text style={styles.axis}>{data[0]?.d?.slice(5) || "—"}</Text>
          <Text style={styles.axis}>{data[data.length - 1]?.d?.slice(5) || "—"}</Text>
        </View>
      </Card>

      <Card>
        <Label>RECORD MEASUREMENT</Label>
        <View style={styles.inlineRow}>
          <Input value={val} onChangeText={setVal} numeric placeholder={`${p.name} today`} style={{ flex: 1, width: undefined }} />
          <Pill label="Log" onPress={record} style={{ paddingHorizontal: 18 }} />
        </View>
      </Card>

      <Card>
        <Label>THRESHOLD LINES</Label>
        <View style={styles.inlineRow}>
          <Input value={thVal} onChangeText={setThVal} numeric placeholder={`Add line at… (${p.unit || p.name})`} style={{ flex: 1, width: undefined }} />
          <Pill label="Add" onPress={addThreshold} style={{ paddingHorizontal: 16 }} />
        </View>
        {thresholds.map((t) => (
          <View key={t.id} style={styles.thRow}>
            <View style={[styles.swatch, { backgroundColor: t.color }]} />
            <Text style={styles.thVal}>
              {t.v}
              {p.unit}
            </Text>
            <IconButton onPress={() => removeThreshold(t.id)}>
              <Trash2 size={15} color={T.danger} />
            </IconButton>
          </View>
        ))}
        {thresholds.length === 0 && (
          <Text style={styles.hint}>Add a line to mark your safe max or target (e.g. Nitrate 25ppm).</Text>
        )}
      </Card>

      <Pill
        variant="outline"
        label="Export all measurements as CSV"
        icon={<BarChart3 size={15} color={T.cyan} />}
        onPress={exportCSV}
        style={{ paddingVertical: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  paramRow: { gap: 8, paddingBottom: 4, marginBottom: 4 },
  chartHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  latest: { fontFamily: MONO, fontSize: 12, color: T.sub },
  axisRow: { flexDirection: "row", justifyContent: "space-between" },
  axis: { fontFamily: MONO, fontSize: 11, color: T.sub },
  inlineRow: { flexDirection: "row", gap: 8, marginTop: 10, alignItems: "center" },
  thRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 10 },
  swatch: { width: 12, height: 12, borderRadius: 6 },
  thVal: { flex: 1, fontSize: 14, fontFamily: MONO, color: T.text },
  hint: { fontSize: 12, color: T.sub, marginTop: 8, fontFamily: FONT },
});
