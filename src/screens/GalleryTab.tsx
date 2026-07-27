import React, { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert, Modal, TextInput } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon, X, Trash2, Check } from "lucide-react-native";
import { T, FONT, MONO } from "../theme";
import { Label, Pill, IconButton, ToolHeader } from "../ui";
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
  const [viewing, setViewing] = useState<Photo | null>(null);
  const [caption, setCaption] = useState("");

  const store = async (asset: ImagePicker.ImagePickerAsset) => {
    const src = await savePhoto(asset.base64, asset.uri, asset.mimeType);
    const photo: Photo = { id: uid(), src, date: todayKey(), tag: "" };
    updateTank(tank.id, { photos: [photo, ...photos] });
  };

  const fromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo access to add tank photos.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7, base64: true });
    if (!res.canceled) store(res.assets[0]);
  };

  const fromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow camera access to take a tank photo.");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: true });
    if (!res.canceled) store(res.assets[0]);
  };

  const add = () => {
    if (!premium && photos.length >= 6) {
      onUpgrade();
      return;
    }
    Alert.alert("Add photo", "Choose a source", [
      { text: "Take photo", onPress: fromCamera },
      { text: "Photo library", onPress: fromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openViewer = (p: Photo) => {
    setViewing(p);
    setCaption(p.tag || "");
  };
  const saveCaption = () => {
    if (!viewing) return;
    updateTank(tank.id, { photos: photos.map((x) => (x.id === viewing.id ? { ...x, tag: caption.trim() } : x)) });
    setViewing(null);
  };
  const removeCurrent = () => {
    if (!viewing) return;
    deletePhoto(viewing.src);
    updateTank(tank.id, { photos: photos.filter((x) => x.id !== viewing.id) });
    setViewing(null);
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
            <Pressable key={p.id} style={styles.tile} onPress={() => openViewer(p)} accessibilityRole="imagebutton" accessibilityLabel={p.tag || `Photo ${p.date}`}>
              <Image source={{ uri: p.src }} style={styles.photo} />
              <View style={styles.caption}>
                <Text style={styles.captionText} numberOfLines={1}>
                  {p.tag ? p.tag : p.date}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {!premium && photos.length >= 4 && (
        <Text style={styles.upsell}>Free albums hold 6 photos. Upgrade for unlimited.</Text>
      )}

      <Modal visible={!!viewing} transparent animationType="fade" onRequestClose={() => setViewing(null)}>
        <View style={styles.viewer}>
          <View style={styles.viewerBar}>
            <IconButton onPress={() => setViewing(null)} accessibilityLabel="Close">
              <X size={22} color="#fff" />
            </IconButton>
            <Text style={styles.viewerDate}>{viewing?.date}</Text>
            <IconButton onPress={removeCurrent} accessibilityLabel="Delete photo">
              <Trash2 size={20} color={T.danger} />
            </IconButton>
          </View>
          {viewing && <Image source={{ uri: viewing.src }} style={styles.viewerImg} resizeMode="contain" />}
          <View style={styles.captionEditor}>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Add a caption…"
              placeholderTextColor={T.sub}
              maxLength={120}
              style={styles.captionInput}
            />
            <Pill label="Save" icon={<Check size={14} color={T.ink} />} onPress={saveCaption} />
          </View>
        </View>
      </Modal>
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
  upsell: { marginTop: 14, fontSize: 12, color: T.gold, textAlign: "center", fontFamily: FONT },

  viewer: { flex: 1, backgroundColor: "rgba(3,10,13,0.97)", justifyContent: "space-between" },
  viewerBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 44, paddingHorizontal: 12 },
  viewerDate: { color: "#fff", fontSize: 13, fontFamily: MONO },
  viewerImg: { flex: 1, width: "100%" },
  captionEditor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 36,
    paddingTop: 12,
  },
  captionInput: {
    flex: 1,
    backgroundColor: "#0a2731",
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: T.text,
    fontSize: 14,
    fontFamily: FONT,
  },
});
