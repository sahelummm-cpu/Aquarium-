import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Reeflog from "./src/Reeflog";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Reeflog />
    </SafeAreaProvider>
  );
}
