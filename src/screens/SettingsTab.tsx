import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Crown,
  Cloud,
  Waves,
  Bell,
  ChevronRight,
  ArrowLeft,
  StickyNote,
  Upload,
  Download,
  Trash2,
} from "lucide-react-native";
import { T, FONT, MONO } from "../theme";
import { Card, Pill, IconButton, ToolHeader } from "../ui";
import { Tank } from "../data";
import { rawBackup } from "../storage";
import { exportBackup, importBackup } from "../backup";

export function SettingsTab({
  premium,
  adsRemoved,
  onUpgrade,
  tanks,
  activeId,
  onDeleteTank,
  onImport,
  onBack,
}: {
  premium: boolean;
  adsRemoved: boolean;
  onUpgrade: () => void;
  tanks: Tank[];
  activeId: string | null;
  onDeleteTank: (id: string) => void;
  onImport: (data: any) => void;
  onBack: () => void;
}) {
  const [dataView, setDataView] = useState(false);
  const dataCount = tanks.reduce(
    (a, t) =>
      a +
      t.logs.length +
      t.livestock.length +
      (t.photos?.length || 0) +
      Object.values(t.measures || {}).reduce((sum, arr) => sum + arr.length, 0),
    0
  );

  const exportData = async () => {
    try {
      const blob = await rawBackup();
      const ok = await exportBackup(blob);
      if (!ok) Alert.alert("Sharing unavailable", "This device can't open a share sheet.");
    } catch {
      Alert.alert("Export failed", "Could not write the backup file.");
    }
  };

  const importData = async () => {
    try {
      const data = await importBackup();
      if (!data) return;
      if (!data || !Array.isArray(data.tanks) || data.tanks.length === 0) {
        Alert.alert("Invalid backup", "That file doesn't look like a Reeflog backup.");
        return;
      }
      Alert.alert("Restore backup?", "This replaces all tanks and data currently on this device.", [
        { text: "Cancel", style: "cancel" },
        { text: "Restore", style: "destructive", onPress: () => onImport(data) },
      ]);
    } catch {
      Alert.alert("Import failed", "Could not read that file.");
    }
  };

  const confirmDeleteTank = () => {
    if (tanks.length <= 1) {
      Alert.alert("Can't delete", "You need at least one tank.");
      return;
    }
    const t = tanks.find((x) => x.id === activeId);
    Alert.alert("Delete tank?", `Permanently delete “${t?.name}” and all its logs, photos and tasks?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => activeId && onDeleteTank(activeId) },
    ]);
  };

  if (dataView) {
    return (
      <View>
        <View style={styles.subHeader}>
          <IconButton onPress={() => setDataView(false)}>
            <ArrowLeft size={19} color={T.text} />
          </IconButton>
          <Text style={styles.subTitle}>Data Management</Text>
        </View>

        <Card>
          <View style={styles.syncRow}>
            <View style={styles.syncCol}>
              <StickyNote size={26} color={T.cyan} />
              <Text style={styles.syncLabel}>On device</Text>
              <Text style={styles.syncCount}>{dataCount} records</Text>
            </View>
            <View style={styles.syncArrows}>
              <ArrowLeft size={14} color={T.sub} style={{ transform: [{ rotate: "180deg" }] }} />
              <ArrowLeft size={14} color={T.sub} />
            </View>
            <View style={styles.syncCol}>
              <Cloud size={26} color={premium ? T.cyan : T.sub} />
              <Text style={styles.syncLabel}>{premium ? "Synced" : "Not backed up"}</Text>
              <Text style={styles.syncCount}>{premium ? dataCount : 0} records</Text>
            </View>
          </View>
        </Card>

        <DataButton
          icon={<Upload size={16} color={T.cyan} />}
          label="Export (Upload)"
          locked={!premium}
          onPress={premium ? exportData : onUpgrade}
        />
        <DataButton
          icon={<Download size={16} color={T.cyan} />}
          label="Import (Download)"
          locked={!premium}
          onPress={premium ? importData : onUpgrade}
        />

        <Text style={styles.dataNote}>
          Your data auto-saves on this device.{" "}
          {premium
            ? "Cloud backup keeps a copy you can restore on any phone."
            : "Upgrade to Premium to back up and restore across devices."}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <ToolHeader title="Settings" onBack={onBack} />
      {!premium && (
        <Pressable onPress={onUpgrade} style={styles.promoWrap}>
          <LinearGradient colors={[T.cyanDim, "#0d3540"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.promo}>
            <View style={styles.promoTitleRow}>
              <Crown size={18} color={T.gold} />
              <Text style={styles.promoTitle}>Reeflog Premium</Text>
            </View>
            <Text style={styles.promoSub}>Unlimited tanks & photos, no ads, cloud backup, dosing calculator.</Text>
            <Text style={styles.promoPrice}>From $2.99/mo →</Text>
          </LinearGradient>
        </Pressable>
      )}

      <Card>
        <Row
          icon={<Crown size={16} color={premium ? T.gold : T.sub} />}
          title="Membership"
          sub={premium ? "Premium — active" : adsRemoved ? "Ads removed" : "Free plan"}
          right={!premium ? <Pill label="Upgrade" onPress={onUpgrade} /> : undefined}
        />
        <Row
          icon={<Cloud size={16} color={T.cyan} />}
          title="Cloud backup & restore"
          sub={premium ? "Tap to manage" : "Premium — tap to view"}
          onPress={() => setDataView(true)}
          right={<ChevronRight size={18} color={T.sub} />}
        />
        <Row
          icon={<Waves size={16} color={T.cyan} />}
          title="Tanks"
          sub={`${tanks.length} tank${tanks.length > 1 ? "s" : ""} · auto-saved`}
        />
        <Row icon={<Bell size={16} color={T.cyan} />} title="Notifications" sub="Reminders for time-sensitive tasks" last />
      </Card>

      <Pressable onPress={confirmDeleteTank} style={styles.deleteBtn}>
        <Trash2 size={16} color={T.danger} />
        <Text style={styles.deleteText}>Delete current tank</Text>
      </Pressable>

      <Text style={styles.footer}>Reeflog v1.0 · data stored on-device</Text>
    </View>
  );
}

function Row({
  icon,
  title,
  sub,
  right,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {right}
    </Pressable>
  );
}

function DataButton({
  icon,
  label,
  locked,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  locked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.dataBtn}>
      <View style={styles.dataBtnLeft}>
        {icon}
        <Text style={styles.dataBtnLabel}>{label}</Text>
      </View>
      {locked && <Crown size={15} color={T.gold} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  subHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 14 },
  subTitle: { fontSize: 17, fontWeight: "700", color: T.text, fontFamily: FONT },
  syncRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  syncCol: { alignItems: "center" },
  syncLabel: { fontSize: 12, color: T.sub, marginTop: 6, fontFamily: FONT },
  syncCount: { fontSize: 13, fontWeight: "600", color: T.text, fontFamily: FONT },
  syncArrows: { gap: 3, alignItems: "center" },
  dataBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 11,
    marginBottom: 10,
  },
  dataBtnLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  dataBtnLabel: { color: T.text, fontSize: 13, fontWeight: "600", fontFamily: FONT },
  dataNote: { fontSize: 12, color: T.sub, textAlign: "center", marginTop: 16, lineHeight: 18, fontFamily: FONT },

  promoWrap: { borderRadius: 18, overflow: "hidden", marginBottom: 12 },
  promo: { padding: 18 },
  promoTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  promoTitle: { color: T.gold, fontWeight: "700", fontSize: 15, fontFamily: FONT },
  promoSub: { fontSize: 12.5, color: T.text, marginTop: 6, opacity: 0.9, fontFamily: FONT },
  promoPrice: { marginTop: 10, fontSize: 13, fontWeight: "700", color: T.cyan, fontFamily: FONT },

  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: T.line },
  rowIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: T.card, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 14, fontWeight: "600", color: T.text, fontFamily: FONT },
  rowSub: { fontSize: 12, color: T.sub, fontFamily: FONT },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.danger + "44",
    backgroundColor: T.danger + "12",
  },
  deleteText: { color: T.danger, fontSize: 14, fontWeight: "600", fontFamily: FONT },
  footer: { textAlign: "center", fontSize: 11, color: T.sub, marginTop: 20, fontFamily: MONO },
});
