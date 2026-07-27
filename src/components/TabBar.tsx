import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  Home,
  Calendar as CalIcon,
  BarChart3,
  Users,
  Wrench,
  LucideIcon,
} from "lucide-react-native";
import { T, FONT } from "../theme";

export type TabId = "home" | "calendar" | "graphs" | "community" | "tools";

const ITEMS: { id: TabId; icon: LucideIcon; label: string }[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "calendar", icon: CalIcon, label: "Calendar" },
  { id: "graphs", icon: BarChart3, label: "Graphs" },
  { id: "community", icon: Users, label: "Community" },
  { id: "tools", icon: Wrench, label: "Tools" },
];

export function TabBar({
  tab,
  setTab,
  bottomInset,
}: {
  tab: string;
  setTab: (t: TabId) => void;
  bottomInset: number;
}) {
  return (
    <View style={[styles.bar, { paddingBottom: 10 + bottomInset }]}>
      {ITEMS.map((it) => {
        const on = tab === it.id;
        const Icon = it.icon;
        return (
          <Pressable key={it.id} onPress={() => setTab(it.id)} style={styles.item}>
            <Icon size={21} color={on ? T.cyan : T.sub} strokeWidth={on ? 2.4 : 2} />
            <Text style={[styles.label, { color: on ? T.cyan : T.sub, fontWeight: on ? "600" : "500" }]}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingHorizontal: 8,
    backgroundColor: "rgba(5,20,26,0.98)",
    borderTopWidth: 1,
    borderTopColor: T.line,
  },
  item: { flex: 1, alignItems: "center", gap: 3 },
  label: { fontSize: 10, fontFamily: FONT },
});
