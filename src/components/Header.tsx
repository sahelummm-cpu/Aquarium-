import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Waves, Image as ImageIcon, Crown, Settings, Fish, Plus } from "lucide-react-native";
import { T, FONT, MONO, CYAN_GRAD } from "../theme";
import { IconButton } from "../ui";
import { Tank, daysBetween, todayKey } from "../data";
import { Units, fmtVol } from "../units";

export function Header({
  active,
  tanks,
  units,
  topInset,
  onSelect,
  onAddTank,
  premium,
  onCrown,
  onSettings,
  onGallery,
}: {
  active?: Tank;
  tanks: Tank[];
  units: Units;
  topInset: number;
  onSelect: (id: string) => void;
  onAddTank: () => void;
  premium: boolean;
  onCrown: () => void;
  onSettings: () => void;
  onGallery: () => void;
}) {
  const age = active ? daysBetween(active.started, todayKey()) : 0;

  return (
    <View style={[styles.wrap, { paddingTop: topInset + 12 }]}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <LinearGradient colors={CYAN_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logo}>
            <Waves size={19} color={T.ink} strokeWidth={2.4} />
          </LinearGradient>
          <Text style={styles.brand}>Reeflog</Text>
        </View>
        <View style={styles.actions}>
          <IconButton onPress={onGallery}>
            <ImageIcon size={18} color={T.sub} />
          </IconButton>
          <IconButton onPress={onCrown} style={{ backgroundColor: premium ? T.gold + "22" : "transparent" }}>
            <Crown size={18} color={premium ? T.gold : T.sub} />
          </IconButton>
          <IconButton onPress={onSettings}>
            <Settings size={18} color={T.sub} />
          </IconButton>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabs}
      >
        {tanks.map((t) => {
          const on = t.id === active?.id;
          return (
            <Pressable key={t.id} onPress={() => onSelect(t.id)} style={styles.tankBtnWrap}>
              {on ? (
                <LinearGradient colors={CYAN_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tankBtn}>
                  <Fish size={14} color={T.ink} />
                  <Text style={[styles.tankLabel, { color: T.ink }]}>{t.name}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.tankBtn, { backgroundColor: T.card, borderWidth: 1, borderColor: T.line }]}>
                  <Fish size={14} color={T.text} />
                  <Text style={[styles.tankLabel, { color: T.text }]}>{t.name}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
        <Pressable onPress={onAddTank} style={styles.addTank}>
          <Plus size={16} color={T.cyan} />
        </Pressable>
      </ScrollView>

      {active && (
        <Text style={styles.meta}>
          {active.type} · {fmtVol(active.volume, units)} · {age} days old
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: T.bg,
    borderBottomWidth: 1,
    borderBottomColor: T.line,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  logo: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  brand: { fontSize: 19, fontWeight: "700", letterSpacing: -0.5, color: T.text, fontFamily: FONT },
  actions: { flexDirection: "row", gap: 2 },
  tabsScroll: { marginTop: 14 },
  tabs: { gap: 8, paddingBottom: 4, alignItems: "center" },
  tankBtnWrap: { borderRadius: 13, overflow: "hidden" },
  tankBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  tankLabel: { fontWeight: "600", fontSize: 13, fontFamily: FONT },
  addTank: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: T.line,
    borderStyle: "dashed",
  },
  meta: { marginTop: 8, fontSize: 12, color: T.sub, fontFamily: MONO },
});
