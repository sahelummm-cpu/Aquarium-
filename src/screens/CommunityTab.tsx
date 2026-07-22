import React, { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Share2, Heart } from "lucide-react-native";
import { T, FONT, MONO } from "../theme";
import { Pill } from "../ui";
import { Tank, CommunityPost, uid } from "../data";
import { savePhoto } from "../photos";

export function CommunityTab({
  tank,
  community,
  setCommunity,
}: {
  tank: Tank;
  community: CommunityPost[];
  setCommunity: (next: CommunityPost[]) => void;
}) {
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => {
    const isLiked = !!liked[id];
    setLiked((l) => ({ ...l, [id]: !isLiked }));
    setCommunity(community.map((p) => (p.id === id ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p)));
  };

  const post = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo access to post your tank.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7, base64: true });
    if (res.canceled) return;
    const asset = res.assets[0];
    const src = await savePhoto(asset.base64, asset.uri, asset.mimeType);
    setCommunity([{ id: uid(), user: "you", tank: tank.name, src, likes: 0, mine: true }, ...community]);
  };

  return (
    <View>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Showcase</Text>
          <Text style={styles.subtitle}>See what other aquarists are keeping</Text>
        </View>
        <Pill label="Post tank" icon={<Share2 size={14} color={T.ink} />} onPress={post} />
      </View>

      <View style={styles.grid}>
        {community.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.media}>
              {p.src ? (
                <Image source={{ uri: p.src }} style={StyleSheet.absoluteFill as any} />
              ) : (
                <LinearGradient
                  colors={p.grad || [T.cardSolid, T.cardSolid]}
                  start={{ x: 0.1, y: 0 }}
                  end={{ x: 0.9, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              {p.mine && (
                <View style={styles.mine}>
                  <Text style={styles.mineText}>YOURS</Text>
                </View>
              )}
            </View>
            <View style={styles.body}>
              <Text style={styles.tankName}>{p.tank}</Text>
              <Text style={styles.user}>@{p.user}</Text>
              <Pressable onPress={() => toggleLike(p.id)} style={styles.likeBtn}>
                <Heart size={14} color={liked[p.id] ? T.coral : T.sub} fill={liked[p.id] ? T.coral : "none"} />
                <Text style={[styles.likeCount, { color: liked[p.id] ? T.coral : T.sub }]}>{p.likes}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>Be kind. Share tips, not spam.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 4, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "700", color: T.text, fontFamily: FONT },
  subtitle: { fontSize: 12, color: T.sub, fontFamily: FONT },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { width: "47.5%", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: T.line, backgroundColor: T.card },
  media: { height: 140, position: "relative" },
  mine: { position: "absolute", top: 8, left: 8, backgroundColor: T.cyan, paddingVertical: 2, paddingHorizontal: 7, borderRadius: 6 },
  mineText: { fontSize: 9, fontWeight: "700", color: T.ink, fontFamily: FONT },
  body: { paddingVertical: 9, paddingHorizontal: 11 },
  tankName: { fontSize: 13, fontWeight: "600", color: T.text, fontFamily: FONT },
  user: { fontSize: 11, color: T.sub, marginBottom: 6, fontFamily: FONT },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  likeCount: { fontSize: 12, fontFamily: FONT },
  footer: { textAlign: "center", fontSize: 11, color: T.sub, marginVertical: 16, fontFamily: MONO },
});
