import React, { useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown, X, Check } from "lucide-react-native";
import { T, FONT, CYAN_GRAD } from "../theme";
import { IconButton } from "../ui";

const FEATURES = [
  "Unlimited tanks & photo albums",
  "Remove all ads",
  "Cloud backup & restore",
  "Water-change & dosing calculators",
  "Unlimited custom parameters",
];

export function Paywall({
  visible,
  onClose,
  onSubscribe,
  onRemoveAds,
}: {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  onRemoveAds: () => void;
}) {
  const [plan, setPlan] = useState<"month" | "year">("year");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Crown size={20} color={T.gold} />
              <Text style={styles.title}>Reeflog Premium</Text>
            </View>
            <IconButton onPress={onClose}>
              <X size={18} color={T.sub} />
            </IconButton>
          </View>

          <View style={styles.features}>
            {FEATURES.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Check size={15} color={T.good} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={styles.plans}>
            <PlanCard
              active={plan === "month"}
              onPress={() => setPlan("month")}
              title="Monthly"
              price="$2.99"
              sub="per month"
            />
            <PlanCard
              active={plan === "year"}
              onPress={() => setPlan("year")}
              title="Yearly"
              price="$19.99"
              sub="$1.67/mo"
              badge="SAVE 44%"
            />
          </View>

          <Pressable onPress={onSubscribe} style={styles.ctaWrap}>
            <LinearGradient colors={CYAN_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
              <Text style={styles.ctaText}>
                Start {plan === "year" ? "Yearly" : "Monthly"} — {plan === "year" ? "$19.99/yr" : "$2.99/mo"}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={onRemoveAds} style={styles.secondary}>
            <Text style={styles.secondaryText}>Just remove ads — $6.99 once</Text>
          </Pressable>

          <Text style={styles.fine}>Cancel anytime. Auto-renews until cancelled.</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function PlanCard({
  active,
  onPress,
  title,
  price,
  sub,
  badge,
}: {
  active: boolean;
  onPress: () => void;
  title: string;
  price: string;
  sub: string;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.planCard,
        {
          backgroundColor: active ? T.cyan + "18" : T.card,
          borderColor: active ? T.cyan : T.line,
          borderWidth: active ? 1.5 : 1,
        },
      ]}
    >
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Text style={styles.planTitle}>{title}</Text>
      <Text style={styles.planPrice}>{price}</Text>
      <Text style={styles.planSub}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(3,15,20,0.75)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: T.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: T.line,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 19, fontWeight: "700", color: T.text, fontFamily: FONT },
  features: { marginTop: 16, gap: 9 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  featureText: { fontSize: 13.5, color: T.text, fontFamily: FONT },
  plans: { flexDirection: "row", gap: 10, marginTop: 18 },
  planCard: { flex: 1, position: "relative", padding: 14, borderRadius: 15 },
  planTitle: { fontSize: 12, color: T.sub, fontFamily: FONT },
  planPrice: { fontSize: 22, fontWeight: "700", color: T.text, fontFamily: FONT },
  planSub: { fontSize: 11, color: T.sub, fontFamily: FONT },
  badge: {
    position: "absolute",
    top: -9,
    right: 10,
    backgroundColor: T.coral,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 7,
  },
  badgeText: { color: T.ink, fontSize: 10, fontWeight: "700", fontFamily: FONT },
  ctaWrap: { marginTop: 16, borderRadius: 14, overflow: "hidden" },
  cta: { paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  ctaText: { fontWeight: "700", fontSize: 15, color: T.ink, fontFamily: FONT },
  secondary: {
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.line,
    alignItems: "center",
  },
  secondaryText: { color: T.text, fontSize: 13.5, fontFamily: FONT },
  fine: { textAlign: "center", fontSize: 10.5, color: T.sub, marginTop: 12, fontFamily: FONT },
});
