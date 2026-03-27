import React, { useState, useRef, useCallback } from "react";
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

  const [mousePos, setMousePos] = useState({ x: width / 2, y: canvasHeight / 2 });
  const [pinned, setPinned] = useState(false);
  const [ior, setIor] = useState(1.5);
  const [bevelWidth, setBevelWidth] = useState(40);
  const [blur, setBlur] = useState(0.6);
  const [cornerN, setCornerN] = useState(4.0);

  const panelW = width * 0.55;
  const panelH = canvasHeight * 0.35;

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

  const panelX = mousePos.x - panelW / 2;
  const panelY = mousePos.y - panelH / 2;

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
    <View style={styles.container}>
      <View
        ref={canvasRef}
        style={{ width, height: canvasHeight, cursor: pinned ? "pointer" : "none" } as any}
        {...webHandlers}
        {...nativeHandlers}
      >
        <Canvas style={{ width, height: canvasHeight }} pointerEvents="none">
          <Fill>
            <Shader source={getFrostedGlassShader()} uniforms={uniforms} />
          </Fill>
        </Canvas>
        <View style={styles.touchHint} pointerEvents="none">
          <Text style={styles.touchHintText}>
            {pinned ? "Click to unpin panel" : "Move to control panel · Click to pin"}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.controlsScroll} contentContainerStyle={styles.controlsContent}>
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
  paramHint: { paddingHorizontal: 20, marginBottom: 8 },
  hintText: { fontSize: 11, color: "rgba(255,255,255,0.3)" },
  explainer: { marginTop: 20, marginHorizontal: 20, padding: 16, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12 },
  explainerTitle: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.7)", marginBottom: 8 },
  explainerText: { fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 20 },
});
