import React from "react";
import {
  Canvas,
  RoundedRect,
  Circle,
  LinearGradient,
  vec,
  Group,
  Rect,
  Paint,
} from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";

interface BackgroundSceneProps {
  width?: number;
  height?: number;
  children?: React.ReactNode;
}

/**
 * A colorful, vibrant background scene drawn with Skia primitives.
 * This provides rich content for the glass effects to refract and distort.
 * Includes gradient bands, circles, and rectangles with saturated colors.
 */
export function BackgroundScene({ children }: BackgroundSceneProps) {
  const { width, height } = useWindowDimensions();

  return (
    <Canvas style={{ width, height, position: "absolute" }}>
      {/* Full-screen gradient background */}
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={["#0f0c29", "#302b63", "#24243e"]}
        />
      </Rect>

      {/* Colorful shapes to make refraction visible */}
      <Group>
        {/* Large warm circle top-left */}
        <Circle cx={width * 0.15} cy={height * 0.12} r={width * 0.2}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width * 0.35, height * 0.25)}
            colors={["#ff6b6b", "#feca57"]}
          />
        </Circle>

        {/* Cool blue circle top-right */}
        <Circle cx={width * 0.85} cy={height * 0.2} r={width * 0.18}>
          <LinearGradient
            start={vec(width * 0.7, height * 0.1)}
            end={vec(width, height * 0.35)}
            colors={["#48dbfb", "#0abde3"]}
          />
        </Circle>

        {/* Green rectangle center-left */}
        <RoundedRect
          x={width * 0.05}
          y={height * 0.35}
          width={width * 0.4}
          height={height * 0.12}
          r={12}
        >
          <LinearGradient
            start={vec(width * 0.05, height * 0.35)}
            end={vec(width * 0.45, height * 0.47)}
            colors={["#2ed573", "#7bed9f"]}
          />
        </RoundedRect>

        {/* Purple band across the middle */}
        <RoundedRect
          x={width * 0.1}
          y={height * 0.5}
          width={width * 0.8}
          height={height * 0.08}
          r={20}
        >
          <LinearGradient
            start={vec(width * 0.1, height * 0.5)}
            end={vec(width * 0.9, height * 0.58)}
            colors={["#a55eea", "#8854d0"]}
          />
        </RoundedRect>

        {/* Orange circle bottom-right */}
        <Circle cx={width * 0.75} cy={height * 0.65} r={width * 0.15}>
          <LinearGradient
            start={vec(width * 0.6, height * 0.55)}
            end={vec(width * 0.9, height * 0.75)}
            colors={["#ff9f43", "#ee5a24"]}
          />
        </Circle>

        {/* Teal rectangle bottom */}
        <RoundedRect
          x={width * 0.15}
          y={height * 0.72}
          width={width * 0.5}
          height={height * 0.06}
          r={16}
        >
          <LinearGradient
            start={vec(width * 0.15, height * 0.72)}
            end={vec(width * 0.65, height * 0.78)}
            colors={["#00d2d3", "#01a3a4"]}
          />
        </RoundedRect>

        {/* Pink circle bottom-left */}
        <Circle cx={width * 0.2} cy={height * 0.85} r={width * 0.12}>
          <LinearGradient
            start={vec(width * 0.08, height * 0.75)}
            end={vec(width * 0.32, height * 0.95)}
            colors={["#f368e0", "#e056a0"]}
          />
        </Circle>

        {/* Small accent dots */}
        <Circle cx={width * 0.5} cy={height * 0.15} r={8} color="#fff" opacity={0.6} />
        <Circle cx={width * 0.65} cy={height * 0.42} r={6} color="#feca57" opacity={0.7} />
        <Circle cx={width * 0.35} cy={height * 0.62} r={10} color="#48dbfb" opacity={0.5} />
        <Circle cx={width * 0.8} cy={height * 0.82} r={7} color="#2ed573" opacity={0.6} />
      </Group>

      {children}
    </Canvas>
  );
}
