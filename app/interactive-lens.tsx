import React, { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, useWindowDimensions, ScrollView, Platform } from "react-native";
import { ControlSlider } from "../components/ControlSlider";
import { useSkiaReady, SkiaLoadingFallback } from "../components/SkiaWeb";

export default function InteractiveLensScreen() {
  const skiaReady = useSkiaReady();
  if (Platform.OS === "web" && !skiaReady) return <SkiaLoadingFallback />;
  return <InteractiveLensContent />;
}

function InteractiveLensContent() {
  const { Canvas, Fill, Shader, vec } = require("@shopify/react-native-skia");
  const { getLiquidGlassShader } = require("../shaders/liquidGlass");

  const { width, height: windowHeight } = useWindowDimensions();
  const canvasHeight = windowHeight * 0.62;

  const [mousePos, setMousePos] = useState({ x: width / 2, y: canvasHeight / 2 });
  const [pinned, setPinned] = useState(false);
  const [ior, setIor] = useState(1.5);
  const [bevelPct, setBevelPct] = useState(0.6);
  const [dispersion, setDispersion] = useState(1.0);
  const [blur, setBlur] = useState(0.3);
  const [specPower, setSpecPower] = useState(8.0);
  const [radiusPct, setRadiusPct] = useState(0.2);

  const radius = radiusPct * width;
  const canvasRef = useRef<View>(null);

  const handleMove = useCallback(
    (pageX: number, pageY: number) => {
      if (pinned) return;
      canvasRef.current?.measure?.(
        (_x: number, _y: number, _w: number, _h: number, px: number, py: number) => {
          setMousePos({ x: pageX - px, y: pageY - py });
        }
      );
    },
    [pinned]
  );

  const handleClick = useCallback(() => {
    setPinned((p) => !p);
  }, []);

  const webHandlers =
    Platform.OS === "web"
      ? {
          onMouseMove: (e: any) => handleMove(e.nativeEvent.pageX, e.nativeEvent.pageY),
          onClick: handleClick,
          onTouchMove: (e: any) => {
            const touch = e.nativeEvent.touches[0];
            if (touch) handleMove(touch.pageX, touch.pageY);
          },
        }
      : {};

  const nativeHandlers =
    Platform.OS !== "web"
      ? {
          onStartShouldSetResponder: () => true,
          onMoveShouldSetResponder: () => true,
          onResponderGrant: (e: any) => {
            handleClick();
            if (!pinned) {
              setMousePos({
                x: e.nativeEvent.locationX,
                y: e.nativeEvent.locationY,
              });
            }
          },
          onResponderMove: (e: any) => {
            if (!pinned) {
              setMousePos({
                x: e.nativeEvent.locationX,
                y: e.nativeEvent.locationY,
              });
            }
          },
        }
      : {};

  const uniforms = {
    iResolution: vec(width, canvasHeight),
    iMouse: vec(mousePos.x, mousePos.y),
    lensRadius: radius,
    ior,
    bevelPct,
    dispersion,
    blurAmount: blur,
    specPower,
    lightAngle: -0.8,
  };

  return (
    <View style={styles.container}>
      <View
        ref={canvasRef}
        style={{ width, height: canvasHeight, cursor: pinned ? "pointer" : "none" } as any}
        {...webHandlers}
        {...nativeHandlers}
      >
        <Canvas style={{ width, height: canvasHeight }} pointerEvents="none">
          <Fill>
            <Shader source={getLiquidGlassShader()} uniforms={uniforms} />
          </Fill>
        </Canvas>
        <View style={styles.touchHint} pointerEvents="none">
          <Text style={styles.touchHintText}>
            {pinned ? "Click to unpin lens" : "Move to control lens · Click to pin"}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.controlsScroll} contentContainerStyle={styles.controlsContent}>
        <Text style={styles.controlsTitle}>Liquid Glass Parameters</Text>
        <ControlSlider label="Lens Radius" value={radiusPct} min={0.08} max={0.4} step={0.01} onValueChange={setRadiusPct} />
        <ControlSlider label="Index of Refraction" value={ior} min={1.0} max={3.0} step={0.05} onValueChange={setIor} />
        <ControlSlider label="Bevel Width" value={bevelPct} min={0.1} max={1.0} step={0.05} onValueChange={setBevelPct} />
        <ControlSlider label="Chromatic Dispersion" value={dispersion} min={0} max={5.0} step={0.1} onValueChange={setDispersion} />
        <ControlSlider label="Blur Intensity" value={blur} min={0} max={1.0} step={0.05} onValueChange={setBlur} />
        <ControlSlider label="Specular Sharpness" value={specPower} min={1} max={32} step={1} onValueChange={setSpecPower} />
        <View style={styles.explainer}>
          <Text style={styles.explainerTitle}>Full Liquid Glass Effect</Text>
          <Text style={styles.explainerText}>
            This combines all the techniques Apple uses in iOS 26's Liquid Glass:{"\n\n"}
            <Text style={styles.bold}>Refraction</Text> — Snell's Law bends the background through a convex lens profile.{"\n\n"}
            <Text style={styles.bold}>Chromatic Aberration</Text> — R/G/B channels each get a slightly different IOR.{"\n\n"}
            <Text style={styles.bold}>Frosted Blur</Text> — Multi-tap sampling softens the refracted image.{"\n\n"}
            <Text style={styles.bold}>Specular Highlights</Text> — Fresnel-like rim light makes the glass edges glow.{"\n\n"}
            All runs as a single SkSL fragment shader on the GPU at 60fps.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  touchHint: { position: "absolute", bottom: 16, left: 0, right: 0, alignItems: "center" },
  touchHintText: {
    fontSize: 13, color: "rgba(255,255,255,0.35)", backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, overflow: "hidden",
  },
  controlsScroll: { flex: 1 },
  controlsContent: { paddingTop: 20, paddingBottom: 60 },
  controlsTitle: { fontSize: 16, fontWeight: "700", color: "#fff", paddingHorizontal: 20, marginBottom: 12 },
  explainer: { marginTop: 20, marginHorizontal: 20, padding: 16, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12 },
  explainerTitle: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.7)", marginBottom: 8 },
  explainerText: { fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 20 },
  bold: { fontWeight: "700", color: "rgba(255,255,255,0.6)" },
});
