import AsyncStorage from "@react-native-async-storage/async-storage";

/* ------------------------------------------------------------------
   Persistence (crash-safe auto-save).
   The web build persisted through an async `window.storage` shim backed
   by localStorage. On native we back the same contract with
   AsyncStorage so tank data survives app restarts and works offline.
------------------------------------------------------------------- */

const KEY = "reeflog:v1";

export async function loadState<T = any>(): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function saveState(state: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota / serialization error — ignore, app stays in-memory */
  }
}

export async function rawBackup(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(KEY)) || "{}";
  } catch {
    return "{}";
  }
}
