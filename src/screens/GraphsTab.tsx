import React, { useState } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent, Alert, ScrollView } from "react-native";
import Svg, { Rect, Line, Polyline, Circle } from "react-native-svg";
import { BarChart3, Trash2, Plus, X, Crown } from "lucide-react-native";
import { T, FONT, MONO } from "../theme";
import { Card, Label, Pill, Chip, Input, IconButton } from "../ui";
import { Tank, ParamPreset, PARAM_PRESETS, CUSTOM_PARAM_COLORS, todayKey, uid } from "../data";
import { Units, tempUnit, toDisplayTemp, fromDisplayTemp } from "../units";
import { exportCSV as shareCSV } from "../backup";

const VB_W = 300;
const VB_H = 130;

export function GraphsTab({
  tank,
  updateTank,
  units,
  customParams,
  setCustomParams,
  premium,
  onUpgrade,
}: {
  tank: Tank;
  updateTank: (id: string, patch: Partial<Tank>) => void;
  units: Units;
  customParams: ParamPreset[];
  setCustomParams: React.Dispatch<React.SetStateAction<ParamPreset[]>>;
  premium: boolean;
  onUpgrade: () => void;
}) {
  const params = [...PARAM_PRESETS, ...customParams];
  const [selParam, setSelParam] = useState(params[0].id);
  const [val, setVal] = useState("");
  const [thVal, setThVal] = useState("");
  const [chartW, setChartW] = useState(300);
  const [addingParam, setAddingParam] = useState(false);
  const [pf, setPf] = useState({ name: "", unit: "", lo: "", hi: "" });

  const p = params.find((x) => x.id === selParam) || params[0];
  const data = tank.measures?.[p.id] || [];
  const thresholds = tank.thresholds?.[p.id] || [];

  // Temperature is stored canonically in °F; convert only for display/input.
  const isTemp = p.id === "temp";
  const unitLabel = isTemp ? tempUnit(units) : p.unit;
  const disp = (v: number) => (isTemp ? toDisplayTemp(v, units) : v);
  const canon = (x: number) => (isTemp ? fromDisplayTemp(x, units) : x);

  const record = () => {
    if (val === "" || isNaN(Number(val))) return;
    const next = { ...(tank.measures || {}) };
    next[p.id] = [...(next[p.id] || []), { d: todayKey(), v: canon(Number(val)) }].slice(-30);
    updateTank(tank.id, { measures: next });
    setVal("");
  };
  const addThreshold = () => {
    if (thVal === "" || isNaN(Number(thVal))) return;
    const colors = [T.danger, T.cyan, T.gold, "#a78bfa"];
    const next = { ...(tank.thresholds || {}) };
    const arr = next[p.id] || [];
    next[p.id] = [...arr, { id: uid(), v: canon(Number(thVal)), color: colors[arr.length % colors.length] }];
    updateTank(tank.id, { thresholds: next });
    setThVal("");
  };
  const removeThreshold = (id: string) => {
    const next = { ...(tank.thresholds || {}) };
    next[p.id] = (next[p.id] || []).filter((t) => t.id !== id);
    updateTank(tank.id, { thresholds: next });
  };

  const addParam = () => {
    if (!premium) {
      onUpgrade();
      return;
    }
    if (!pf.name.trim()) return;
    const id = "c_" + uid();
    const lo = Number(pf.lo) || 0;
    const hi = Number(pf.hi) || Math.max(lo + 1, 1);
    setCustomParams((cs) => [
      ...cs,
      { id, name: pf.name.trim(), unit: pf.unit.trim(), color: CUSTOM_PARAM_COLORS[cs.length % CUSTOM_PARAM_COLORS.length], lo, hi, custom: true },
    ]);
    setSelParam(id);
    setPf({ name: "", unit: "", lo: "", hi: "" });
    setAddingParam(false);
  };
  const removeParam = () => {
    Alert.alert("Remove parameter?", `Delete “${p.name}” and its readings from the chart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setCustomParams((cs) => cs.filter((x) => x.id !== p.id));
          setSelParam(PARAM_PRESETS[0].id);
        },
      },
    ]);
  };

  const exportCSV = async () => {
    const rows: (string | number)[][] = [["param", "unit", "date", "value"]];
    params.forEach((pp) => {
      const t = pp.id === "temp";
      (tank.measures?.[pp.id] || []).forEach((mm) =>
        rows.push([pp.name, t ? tempUnit(units) : pp.unit, mm.d, t ? toDisplayTemp(mm.v, units) : mm.v])
      );
    });
    if (rows.length === 1) {
      Alert.alert("Nothing to export", "Record a measurement first.");
      return;
    }
    try {
      const ok = await shareCSV(rows);
      if (!ok) Alert.alert("Sharing unavailable", "This device can't open a share sheet.");
    } catch {
      Alert.alert("Export failed", "Could not write the CSV file.");
    }
  };

  const thVals = thresholds.map((t) => t.v);
  const vals = data.map((d) => d.v);
  const max = Math.max(...vals, ...thVals, p.hi || 1);
  const min = Math.min(...vals, ...thVals, p.lo || 0);
  const range = max - min || 1;
  const yFor = (v: number) => VB_H - ((v - min) / range) * 120 - 5;
  const chartH = (chartW * VB_H) / VB_W;
  const latest = vals.length ? `${disp(vals[vals.length - 1])}${unitLabel}` : "—";

  const onChartLayout = (e: LayoutChangeEvent) => setChartW(e.nativeEvent.layout.width);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paramRow}>
        {params.map((pp) => (
          <Chip key={pp.id} label={pp.name} active={pp.id === selParam} activeColor={pp.color} onPress={() => setSelParam(pp.id)} />
        ))}
        <Chip
          label="＋ Param"
          icon={!premium ? <Crown size={12} color={T.gold} /> : undefined}
          onPress={() => (premium ? setAddingParam(true) : onUpgrade())}
        />
      </ScrollView>

      {addingParam && (
        <Card>
          <Label>ADD CUSTOM PARAMETER</Label>
          <Input autoFocus value={pf.name} onChangeText={(v) => setPf({ ...pf, name: v })} placeholder="Name (e.g. Salinity)" style={{ marginTop: 10 }} />
          <Input value={pf.unit} onChangeText={(v) => setPf({ ...pf, unit: v })} placeholder="Unit (e.g. ppt)" style={{ marginTop: 10 }} />
          <View style={styles.inlineRow}>
            <Input value={pf.lo} onChangeText={(v) => setPf({ ...pf, lo: v })} numeric placeholder="Safe min" style={{ flex: 1, width: undefined }} />
            <Input value={pf.hi} onChangeText={(v) => setPf({ ...pf, hi: v })} numeric placeholder="Safe max" style={{ flex: 1, width: undefined }} />
          </View>
          <View style={styles.formActions}>
            <Pill label="Add parameter" onPress={addParam} style={{ flex: 1, paddingVertical: 10 }} />
            <IconButton onPress={() => setAddingParam(false)} accessibilityLabel="Cancel">
              <X size={16} color={T.sub} />
            </IconButton>
          </View>
        </Card>
      )}

      <Card>
        <View style={styles.chartHead}>
          <Label>
            {p.name} {unitLabel ? `(${unitLabel})` : ""}
          </Label>
          <View style={styles.chartHeadRight}>
            <Text style={styles.latest}>latest {latest}</Text>
            {p.custom && (
              <IconButton onPress={removeParam} accessibilityLabel="Remove parameter" style={styles.paramTrash}>
                <Trash2 size={14} color={T.danger} />
              </IconButton>
            )}
          </View>
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
          <Input value={val} onChangeText={setVal} numeric placeholder={`${p.name} today${unitLabel ? ` (${unitLabel})` : ""}`} style={{ flex: 1, width: undefined }} />
          <Pill label="Log" onPress={record} style={{ paddingHorizontal: 18 }} />
        </View>
      </Card>

      <Card>
        <Label>THRESHOLD LINES</Label>
        <View style={styles.inlineRow}>
          <Input value={thVal} onChangeText={setThVal} numeric placeholder={`Add line at… (${unitLabel || p.name})`} style={{ flex: 1, width: undefined }} />
          <Pill label="Add" onPress={addThreshold} style={{ paddingHorizontal: 16 }} />
        </View>
        {thresholds.map((t) => (
          <View key={t.id} style={styles.thRow}>
            <View style={[styles.swatch, { backgroundColor: t.color }]} />
            <Text style={styles.thVal}>
              {disp(t.v)}
              {unitLabel}
            </Text>
            <IconButton onPress={() => removeThreshold(t.id)} accessibilityLabel="Remove threshold">
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
  chartHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chartHeadRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  paramTrash: { width: 28, height: 28 },
  latest: { fontFamily: MONO, fontSize: 12, color: T.sub },
  axisRow: { flexDirection: "row", justifyContent: "space-between" },
  axis: { fontFamily: MONO, fontSize: 11, color: T.sub },
  inlineRow: { flexDirection: "row", gap: 8, marginTop: 10, alignItems: "center" },
  formActions: { flexDirection: "row", gap: 8, marginTop: 12, alignItems: "center" },
  thRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 10 },
  swatch: { width: 12, height: 12, borderRadius: 6 },
  thVal: { flex: 1, fontSize: 14, fontFamily: MONO, color: T.text },
  hint: { fontSize: 12, color: T.sub, marginTop: 8, fontFamily: FONT },
});
