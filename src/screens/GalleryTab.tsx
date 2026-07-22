import React from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";
import { T, FONT, MONO } from "../theme";
import { Label, Pill, ToolHeader } from "../ui";
import { Tank, Photo, todayKey, uid } from "../data";
import { savePhoto, deletePhoto } from "../photos";

export function GalleryTab({
  tank,
  updateTank,
  premium,
  onUpgrade,
  onBack,
}: {
  tank: Tank;
  updateTank: (id: string, patch: Partial<Tank>) => void;
  premium: boolean;
  onUpgrade: () => void;
  onBack: () => void;
}) {
  const photos = tank.photos || [];

  const add = async () => {
    if (!premium && photos.length >= 6) {
      onUpgrade();
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo access to add tank photos.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7, base64: true });
    if (res.canceled) return;
    const asset = res.assets[0];
    const src = await savePhoto(asset.base64, asset.uri, asset.mimeType);
    const photo: Photo = { id: uid(), src, date: todayKey(), tag: "" };
    updateTank(tank.id, { photos: [photo, ...photos] });
  };

  const remove = (p: Photo) => {
    deletePhoto(p.src);
    updateTank(tank.id, { photos: photos.filter((x) => x.id !== p.id) });
  };

  return (
    <View>
      <ToolHeader
        title={`${tank.name} · Album`}
        onBack={onBack}
        right={<Pill label="Add photo" icon={<Camera size={14} color={T.ink} />} onPress={add} />}
      />

      {photos.length === 0 ? (
        <View style={styles.empty}>
          <ImageIcon size={38} color={T.cyanDim} style={{ marginBottom: 10 }} />
          <Text style={styles.emptyTitle}>Build a photo timeline of your tank.</Text>
          <Text style={styles.emptySub}>Track growth and color over time — multiple photos per tank.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {photos.map((p) => (
            <View key={p.id} style={styles.tile}>
              <Image source={{ uri: p.src }} style={styles.photo} />
              <View style={styles.caption}>
                <Text style={styles.captionText}>{p.date}</Text>
              </View>
              <Pressable onPress={() => remove(p)} accessibilityRole="button" accessibilityLabel="Remove photo" style={styles.removeBtn}>
                <X size={13} color="#fff" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {!premium && photos.length >= 4 && (
        <Text style={styles.upsell}>Free albums hold 6 photos. Upgrade for unlimited.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 14, color: T.sub, fontFamily: FONT, textAlign: "center" },
  emptySub: { fontSize: 12, color: T.sub, marginTop: 4, fontFamily: FONT, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { width: "48.5%", borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: T.line },
  photo: { width: "100%", height: 150 },
  caption: { position: "absolute", bottom: 0, left: 0, right: 0, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: "rgba(4,20,26,0.7)" },
  captionText: { fontSize: 11, fontFamily: MONO, color: T.text },
  removeBtn: { position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(4,20,26,0.7)" },
  upsell: { marginTop: 14, fontSize: 12, color: T.gold, textAlign: "center", fontFamily: FONT },
});
