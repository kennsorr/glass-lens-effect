import React, { useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions, ScrollView, Platform } from "react-native";
import { ControlSlider } from "../components/ControlSlider";
import { useSkiaReady, SkiaLoadingFallback } from "../components/SkiaWeb";

export default function BasicLensScreen() {
  const skiaReady = useSkiaReady();
  if (Platform.OS === "web" && !skiaReady) return <SkiaLoadingFallback />;
  return <BasicLensContent />;
}

function BasicLensContent() {
  const { Canvas, Fill, Shader, vec } = require("@shopify/react-native-skia");
  const { getLensShader } = require("../shaders/lens");

  const { width, height: windowHeight } = useWindowDimensions();
  const canvasHeight = windowHeight * 0.6;

  const [ior, setIor] = useState(1.5);
  const [bevelPct, setBevelPct] = useState(0.65);
  const [radiusPct, setRadiusPct] = useState(0.25);

  const radius = radiusPct * width;

  const uniforms = {
    iResolution: vec(width, canvasHeight),
    center: vec(width / 2, canvasHeight / 2),
    radius,
    ior,
    bevelPct,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Canvas style={{ width, height: canvasHeight }}>
        <Fill>
          <Shader source={getLensShader()} uniforms={uniforms} />
        </Fill>
      </Canvas>

      <View style={styles.controls}>
        <Text style={styles.controlsTitle}>Lens Parameters</Text>
        <ControlSlider label="Index of Refraction" value={ior} min={1.0} max={3.0} step={0.05} onValueChange={setIor} />
        <View style={styles.paramHint}>
          <Text style={styles.hintText}>1.0 = air  ·  1.33 = water  ·  1.5 = glass  ·  2.4 = diamond</Text>
        </View>
        <ControlSlider label="Bevel Width" value={bevelPct} min={0.1} max={1.0} step={0.05} onValueChange={setBevelPct} />
        <ControlSlider label="Lens Radius" value={radiusPct} min={0.1} max={0.45} step={0.01} onValueChange={setRadiusPct} />
        <View style={styles.explainer}>
          <Text style={styles.explainerTitle}>How it works</Text>
          <Text style={styles.explainerText}>
            This shader implements a convex lens using Snell's Law: n₁sin(θ₁) = n₂sin(θ₂).
            The glass surface follows a circular arc profile. At the bevel edge, the surface
            slopes steeply — bending light the most. At the flat center, there's minimal
            refraction. Higher IOR = more bending.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { paddingBottom: 40 },
  controls: { paddingTop: 20, paddingBottom: 20 },
  controlsTitle: { fontSize: 16, fontWeight: "700", color: "#fff", paddingHorizontal: 20, marginBottom: 12 },
  paramHint: { paddingHorizontal: 20, marginBottom: 8 },
  hintText: { fontSize: 11, color: "rgba(255,255,255,0.3)" },
  explainer: { marginTop: 20, marginHorizontal: 20, padding: 16, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12 },
  explainerTitle: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.7)", marginBottom: 8 },
  explainerText: { fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 20 },
});
