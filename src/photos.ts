import * as FileSystem from "expo-file-system/legacy";
import { uid } from "./data";

/* ------------------------------------------------------------------
   File-based photo storage.

   Photos used to be stored as base64 data URIs inside the single JSON
   state blob. On Android that quickly overruns AsyncStorage's ~6MB
   ceiling and silently drops the ENTIRE app state, not just the photo.
   Instead we now write each image to the app's document directory and
   keep only the lightweight `file://` URI in state.
------------------------------------------------------------------- */

const PHOTO_DIR = FileSystem.documentDirectory + "reeflog-photos/";

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(PHOTO_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
  }
}

function extFor(mimeType?: string) {
  if (!mimeType) return "jpg";
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("heic")) return "heic";
  return "jpg";
}

/**
 * Persist a picked image to disk and return its stable file URI.
 * Falls back to the original picker URI if the write fails for any reason.
 */
export async function savePhoto(base64: string | null | undefined, uri: string, mimeType?: string): Promise<string> {
  try {
    if (!base64) return uri;
    await ensureDir();
    const dest = `${PHOTO_DIR}${uid()}.${extFor(mimeType)}`;
    await FileSystem.writeAsStringAsync(dest, base64, { encoding: FileSystem.EncodingType.Base64 });
    return dest;
  } catch {
    return uri;
  }
}

/** Delete a photo file we own. No-ops for non-managed URIs (e.g. seed data). */
export async function deletePhoto(fileUri: string): Promise<void> {
  try {
    if (fileUri && fileUri.startsWith(PHOTO_DIR)) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  } catch {
    /* ignore — a missing file is fine */
  }
}
