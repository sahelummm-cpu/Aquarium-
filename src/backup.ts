import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

/* ------------------------------------------------------------------
   Real file export / import.
   CSV measurement export and full JSON backup both write a file to the
   cache directory and hand it to the OS share sheet. Restore reads a
   backup file the user picks and parses it back into app state.
------------------------------------------------------------------- */

async function writeAndShare(filename: string, contents: string, mimeType: string): Promise<boolean> {
  const uri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, contents, { encoding: FileSystem.EncodingType.UTF8 });
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: filename, UTI: mimeType === "text/csv" ? "public.comma-separated-values-text" : "public.json" });
  return true;
}

export async function exportCSV(rows: (string | number)[][]): Promise<boolean> {
  const csv = rows
    .map((r) => r.map((cell) => (/[",\n]/.test(String(cell)) ? `"${String(cell).replace(/"/g, '""')}"` : String(cell))).join(","))
    .join("\n");
  return writeAndShare("reeflog-measurements.csv", csv, "text/csv");
}

export async function exportBackup(json: string): Promise<boolean> {
  return writeAndShare("reeflog-backup.json", json, "application/json");
}

/** Opens a file picker and returns the parsed backup object, or null. */
export async function importBackup(): Promise<any | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain", "*/*"],
    copyToCacheDirectory: true,
  });
  if (res.canceled || !res.assets?.length) return null;
  const raw = await FileSystem.readAsStringAsync(res.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
  return JSON.parse(raw);
}
