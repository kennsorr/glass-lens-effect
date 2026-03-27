import React, { useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions, ScrollView, Platform } from "react-native";
import { ControlSlider } from "../components/ControlSlider";
import { useSkiaReady, SkiaLoadingFallback } from "../components/SkiaWeb";

export default function GlassPanelScreen() {
  const skiaReady = useSkiaReady();
  if (Platform.OS === "web" && !skiaReady) return <SkiaLoadingFallback />;
  return <GlassPanelContent />;
}

function GlassPanelContent() {
  const { Canvas, Fill, Shader, vec } = require("@shopify/react-native-skia");
  const { getFrostedGlassShader } = require("../shaders/frostedGlass");

  const { width, height: windowHeight } = useWindowDimensions();
  const canvasHeight = windowHeight * 0.6;

  const [ior, setIor] = useState(1.5);
  const [bevelWidth, setBevelWidth] = useState(40);
  const [blur, setBlur] = useState(0.6);
  const [cornerN, setCornerN] = useState(4.0);

  const panelW = width * 0.75;
  const panelH = canvasHeight * 0.35;
  const panelX = (width - panelW) / 2;
  const panelY = (canvasHeight - panelH) / 2;

  const uniforms = {
    iResolution: vec(width, canvasHeight),
    panelPos: vec(panelX, panelY),
    panelSize: vec(panelW, panelH),
    cornerN,
    bevelWidth,
    ior,
    blurAmount: blur,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Canvas style={{ width, height: canvasHeight }}>
        <Fill>
          <Shader source={getFrostedGlassShader()} uniforms={uniforms} />
        </Fill>
      </Canvas>

      <View style={styles.controls}>
        <Text style={styles.controlsTitle}>Glass Panel Parameters</Text>
        <ControlSlider label="Squircle Exponent (n)" value={cornerN} min={2.0} max={10.0} step={0.5} onValueChange={setCornerN} />
        <View style={styles.paramHint}>
          <Text style={styles.hintText}>2 = ellipse  ·  4 = Apple squircle  ·  10+ = sharp rectangle</Text>
        </View>
        <ControlSlider label="Bevel Width (px)" value={bevelWidth} min={10} max={80} step={2} onValueChange={setBevelWidth} />
        <ControlSlider label="Index of Refraction" value={ior} min={1.0} max={2.5} step={0.05} onValueChange={setIor} />
        <ControlSlider label="Blur Intensity" value={blur} min={0} max={1.0} step={0.05} onValueChange={setBlur} />
        <View style={styles.explainer}>
          <Text style={styles.explainerTitle}>About Squircles</Text>
          <Text style={styles.explainerText}>
            Apple uses superellipses (squircles) defined by |x/a|ⁿ + |y/b|ⁿ = 1 instead of
            rounded rectangles. At n=4, you get Apple's signature smooth corners with
            continuous curvature — no abrupt transition where the arc meets the straight edge.
            The SDF (Signed Distance Field) drives both the shape mask and the bevel geometry.
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
