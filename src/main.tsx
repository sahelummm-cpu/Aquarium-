import React from "react";
import { createRoot } from "react-dom/client";
import Reeflog from "./Reeflog";
import "./index.css";

/* ------------------------------------------------------------------
   window.storage shim
   Reeflog persists through an async `window.storage` API (get/set).
   In the browser we back it with localStorage so data survives
   reloads and works offline. The shape matches what Reeflog expects:
     get(key) -> { value } | null
     set(key, value) -> void
------------------------------------------------------------------- */
declare global {
  interface Window {
    storage: {
      get: (key: string) => Promise<{ value: string } | null>;
      set: (key: string, value: string) => Promise<void>;
      remove: (key: string) => Promise<void>;
    };
  }
}

if (!window.storage) {
  window.storage = {
    async get(key) {
      try {
        const value = localStorage.getItem(key);
        return value == null ? null : { value };
      } catch {
        return null;
      }
    },
    async set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* quota / private mode — ignore, app stays in-memory */
      }
    },
    async remove(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Reeflog />
  </React.StrictMode>
);

/* Register the service worker for offline / installable PWA support. */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* SW is a progressive enhancement — ignore failures */
    });
  });
}
