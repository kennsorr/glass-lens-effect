import React, { useEffect, useState } from "react";
import { Platform, View, Text, ActivityIndicator, StyleSheet } from "react-native";

let skiaReady = Platform.OS !== "web";
let skiaLoadPromise: Promise<void> | null = null;

function loadSkia(): Promise<void> {
  if (skiaReady) return Promise.resolve();
  if (!skiaLoadPromise) {
    skiaLoadPromise = import("@shopify/react-native-skia/lib/module/web")
      .then((mod) =>
        (mod as any).LoadSkiaWeb({
          locateFile: () => {
            const base = (process.env.EXPO_PUBLIC_BASE_URL as string) || "";
            return `${base}/canvaskit.wasm`;
          },
        })
      )
      .then(() => {
        skiaReady = true;
      });
  }
  return skiaLoadPromise;
}

if (Platform.OS === "web") {
  loadSkia();
}

export function useSkiaReady(): boolean {
  const [ready, setReady] = useState(skiaReady);

  useEffect(() => {
    if (skiaReady) {
      setReady(true);
      return;
    }
    let cancelled = false;
    loadSkia().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

export function SkiaLoadingFallback() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#48dbfb" />
      <Text style={styles.loadingText}>Loading Skia engine...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  loadingText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    marginTop: 16,
  },
});
