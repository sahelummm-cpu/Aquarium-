import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { T } from "./theme";
import { loadState, saveState } from "./storage";
import {
  Tank,
  Species,
  CommunityPost,
  seedTank,
  emptyTank,
  SEED_COMMUNITY,
} from "./data";
import { Header } from "./components/Header";
import { TabBar, TabId } from "./components/TabBar";
import { Paywall } from "./components/Paywall";
import { HomeTab } from "./screens/HomeTab";
import { CalendarTab } from "./screens/CalendarTab";
import { GraphsTab } from "./screens/GraphsTab";
import { GalleryTab } from "./screens/GalleryTab";
import { ToolsTab } from "./screens/ToolsTab";
import { CommunityTab } from "./screens/CommunityTab";
import { SettingsTab } from "./screens/SettingsTab";

type Tab = TabId | "gallery" | "settings";

type PersistShape = {
  tanks: Tank[];
  activeId: string | null;
  premium: boolean;
  adsRemoved: boolean;
  customFish: Species[];
  community: CommunityPost[];
};

export default function Reeflog() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>("home");
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [premium, setPremium] = useState(false);
  const [adsRemoved, setAdsRemoved] = useState(false);
  const [customFish, setCustomFish] = useState<Species[]>([]);
  const [community, setCommunity] = useState<CommunityPost[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [ready, setReady] = useState(false);
  const first = useRef(true);

  /* load once */
  useEffect(() => {
    (async () => {
      const st = await loadState<PersistShape>();
      if (st && st.tanks?.length) {
        setTanks(st.tanks);
        setActiveId(st.activeId || st.tanks[0].id);
        setPremium(!!st.premium);
        setAdsRemoved(!!st.adsRemoved);
        setCustomFish(st.customFish || []);
        setCommunity(st.community || SEED_COMMUNITY);
      } else {
        const t = seedTank();
        setTanks([t]);
        setActiveId(t.id);
        setCommunity(SEED_COMMUNITY);
      }
      setReady(true);
    })();
  }, []);

  /* auto-save on every change (crash-safe) */
  useEffect(() => {
    if (!ready) return;
    if (first.current) {
      first.current = false;
      return;
    }
    saveState({ tanks, activeId, premium, adsRemoved, customFish, community });
  }, [tanks, activeId, premium, adsRemoved, customFish, community, ready]);

  const active = tanks.find((t) => t.id === activeId) || tanks[0];

  const updateTank = (id: string, patch: Partial<Tank>) =>
    setTanks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const addTank = () => {
    if (!premium && tanks.length >= 2) {
      setShowPaywall(true);
      return;
    }
    const t = emptyTank(tanks.length + 1);
    setTanks((ts) => [...ts, t]);
    setActiveId(t.id);
    setTab("home");
  };

  if (!ready) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={T.cyan} />
        <Text style={styles.loading}>Loading your tanks…</Text>
      </View>
    );
  }

  const showAds = !premium && !adsRemoved;
  const openPaywall = () => setShowPaywall(true);

  return (
    <View style={styles.root}>
      <Header
        active={active}
        tanks={tanks}
        topInset={insets.top}
        onSelect={setActiveId}
        onAddTank={addTank}
        premium={premium}
        onCrown={openPaywall}
        onSettings={() => setTab("settings")}
        onGallery={() => setTab("gallery")}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {active && tab === "home" && (
          <HomeTab tank={active} updateTank={updateTank} showAds={showAds} onUpgrade={openPaywall} />
        )}
        {active && tab === "calendar" && <CalendarTab tank={active} updateTank={updateTank} />}
        {active && tab === "graphs" && <GraphsTab tank={active} updateTank={updateTank} />}
        {active && tab === "gallery" && (
          <GalleryTab tank={active} updateTank={updateTank} premium={premium} onUpgrade={openPaywall} />
        )}
        {active && tab === "tools" && (
          <ToolsTab
            tank={active}
            updateTank={updateTank}
            premium={premium}
            onUpgrade={openPaywall}
            customFish={customFish}
            setCustomFish={setCustomFish}
          />
        )}
        {active && tab === "community" && (
          <CommunityTab tank={active} community={community} setCommunity={setCommunity} />
        )}
        {tab === "settings" && (
          <SettingsTab premium={premium} adsRemoved={adsRemoved} onUpgrade={openPaywall} tanks={tanks} />
        )}
      </ScrollView>

      <TabBar tab={tab} setTab={(t) => setTab(t)} bottomInset={insets.bottom} />

      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={() => {
          setPremium(true);
          setAdsRemoved(true);
          setShowPaywall(false);
        }}
        onRemoveAds={() => {
          setAdsRemoved(true);
          setShowPaywall(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  center: { alignItems: "center", justifyContent: "center" },
  loading: { color: T.sub, marginTop: 12 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28 },
});
