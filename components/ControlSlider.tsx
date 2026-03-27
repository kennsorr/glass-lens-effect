import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
}

/**
 * A labeled slider control for adjusting shader uniforms.
 * Displays the current value and a human-readable label.
 */
export function ControlSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onValueChange,
}: ControlSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value.toFixed(2)}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor="rgba(255,255,255,0.6)"
        maximumTrackTintColor="rgba(255,255,255,0.15)"
        thumbTintColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "500",
  },
  value: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontFamily: "monospace",
  },
  slider: {
    width: "100%",
    height: 32,
  },
});
