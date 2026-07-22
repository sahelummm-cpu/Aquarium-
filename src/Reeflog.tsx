import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as QuickActions from "expo-quick-actions";
import { T } from "./theme";
import { loadState, saveState } from "./storage";
import {
  Tank,
  Species,
  CommunityPost,
  TimerItem,
  seedTank,
  emptyTank,
  defaultTimers,
  SEED_COMMUNITY,
} from "./data";
import { deletePhoto } from "./photos";
import { ensureNotificationPermission, cancelReminder } from "./notifications";
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

const QUICK_ACTIONS: QuickActions.Action[] = [
  { id: "log", title: "Log a reading", icon: Platform.OS === "ios" ? "compose" : undefined, params: { tab: "home" } },
  { id: "tasks", title: "Tasks", icon: Platform.OS === "ios" ? "task" : undefined, params: { tab: "calendar" } },
  { id: "graphs", title: "Graphs", icon: Platform.OS === "ios" ? "search" : undefined, params: { tab: "graphs" } },
  { id: "gallery", title: "Gallery", icon: Platform.OS === "ios" ? "capturePhoto" : undefined, params: { tab: "gallery" } },
];

const VALID_TABS: Tab[] = ["home", "calendar", "graphs", "gallery", "tools", "community", "settings"];

export default function Reeflog() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>("home");
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [premium, setPremium] = useState(false);
  const [adsRemoved, setAdsRemoved] = useState(false);
  const [customFish, setCustomFish] = useState<Species[]>([]);
  const [community, setCommunity] = useState<CommunityPost[]>([]);
  const [timers, setTimers] = useState<TimerItem[]>(defaultTimers);
  const [showPaywall, setShowPaywall] = useState(false);
  const [ready, setReady] = useState(false);
  const first = useRef(true);
  const warnedFull = useRef(false);

  /* load once + ask for notification permission */
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
    ensureNotificationPermission();
  }, []);

  /* home-screen quick actions (deep-link into a tab) */
  useEffect(() => {
    const handle = (action: QuickActions.Action | null | undefined) => {
      const target = action?.params?.tab;
      if (typeof target === "string" && (VALID_TABS as string[]).includes(target)) {
        setTab(target as Tab);
      }
    };
    QuickActions.setItems(QUICK_ACTIONS).catch(() => {});
    handle(QuickActions.initial);
    const sub = QuickActions.addListener(handle);
    return () => sub.remove();
  }, []);

  /* auto-save on every change (crash-safe), warning once if storage is full */
  useEffect(() => {
    if (!ready) return;
    if (first.current) {
      first.current = false;
      return;
    }
    (async () => {
      const ok = await saveState({ tanks, activeId, premium, adsRemoved, customFish, community });
      if (!ok && !warnedFull.current) {
        warnedFull.current = true;
        Alert.alert(
          "Storage full",
          "Your latest change couldn't be saved — the device is out of app storage. Remove some photos and try again."
        );
      }
    })();
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

  const deleteTank = (id: string) => {
    const t = tanks.find((x) => x.id === id);
    t?.photos?.forEach((p) => deletePhoto(p.src));
    t?.tasks?.forEach((task) => cancelReminder(task.notifId));
    const rest = tanks.filter((x) => x.id !== id);
    setTanks(rest);
    if (activeId === id) setActiveId(rest[0]?.id ?? null);
    setTab("home");
  };

  const importData = (data: any) => {
    if (!data || !Array.isArray(data.tanks) || data.tanks.length === 0) return;
    setTanks(data.tanks);
    const validActive = data.activeId && data.tanks.some((t: Tank) => t.id === data.activeId);
    setActiveId(validActive ? data.activeId : data.tanks[0].id);
    setPremium(!!data.premium);
    setAdsRemoved(!!data.adsRemoved);
    setCustomFish(Array.isArray(data.customFish) ? data.customFish : []);
    if (Array.isArray(data.community)) setCommunity(data.community);
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
  const goHome = () => setTab("home");

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

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {active && tab === "home" && (
            <HomeTab tank={active} updateTank={updateTank} showAds={showAds} onUpgrade={openPaywall} />
          )}
          {active && tab === "calendar" && <CalendarTab tank={active} updateTank={updateTank} />}
          {active && tab === "graphs" && <GraphsTab tank={active} updateTank={updateTank} />}
          {active && tab === "gallery" && (
            <GalleryTab tank={active} updateTank={updateTank} premium={premium} onUpgrade={openPaywall} onBack={goHome} />
          )}
          {active && tab === "tools" && (
            <ToolsTab
              tank={active}
              updateTank={updateTank}
              premium={premium}
              onUpgrade={openPaywall}
              customFish={customFish}
              setCustomFish={setCustomFish}
              timers={timers}
              setTimers={setTimers}
            />
          )}
          {active && tab === "community" && (
            <CommunityTab tank={active} community={community} setCommunity={setCommunity} />
          )}
          {tab === "settings" && (
            <SettingsTab
              premium={premium}
              adsRemoved={adsRemoved}
              onUpgrade={openPaywall}
              tanks={tanks}
              activeId={activeId}
              onDeleteTank={deleteTank}
              onImport={importData}
              onBack={goHome}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  loading: { color: T.sub, marginTop: 12 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28 },
});
