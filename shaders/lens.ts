import { Skia, SkRuntimeEffect } from "@shopify/react-native-skia";

/**
 * Basic lens refraction shader — fully self-contained.
 *
 * Generates a colorful procedural background and applies a convex lens
 * using Snell's Law. Works as a Shader paint (not an image filter),
 * so it runs on both native and web (CanvasKit).
 *
 * Uniforms:
 *   iResolution – viewport size in pixels
 *   center      – lens center in pixels
 *   radius      – lens radius in pixels
 *   ior         – index of refraction (1.0=air, 1.5=glass, 2.4=diamond)
 *   bevelPct    – bevel width as fraction of radius (0..1)
 */
const LENS_SOURCE = `
uniform float2 iResolution;
uniform float2 center;
uniform float  radius;
uniform float  ior;
uniform float  bevelPct;

half3 scene(float2 uv) {
    half3 c = mix(half3(0.059, 0.047, 0.161), half3(0.188, 0.169, 0.388),
                  uv.x * 0.6 + uv.y * 0.4);
    c = mix(c, half3(0.141, 0.141, 0.243), uv.y);

    float d; float t;

    d = length(uv - float2(0.15, 0.2));
    t = smoothstep(0.18, 0.0, d);
    c = mix(c, mix(half3(0.99, 0.79, 0.34), half3(1.0, 0.42, 0.42), t),
            step(d, 0.18));

    d = length(uv - float2(0.85, 0.25));
    t = smoothstep(0.16, 0.0, d);
    c = mix(c, mix(half3(0.04, 0.74, 0.89), half3(0.28, 0.86, 0.98), t),
            step(d, 0.16));

    float2 p = abs(uv - float2(0.25, 0.58)) - float2(0.17, 0.04);
    float rr = length(max(p, float2(0.0))) + min(max(p.x, p.y), 0.0) - 0.015;
    c = mix(c, mix(half3(0.18, 0.84, 0.45), half3(0.48, 0.93, 0.62),
                   (uv.x - 0.08) / 0.34), smoothstep(0.003, 0.0, rr));

    p = abs(uv - float2(0.72, 0.5)) - float2(0.2, 0.035);
    rr = length(max(p, float2(0.0))) + min(max(p.x, p.y), 0.0) - 0.02;
    c = mix(c, mix(half3(0.65, 0.37, 0.92), half3(0.53, 0.33, 0.82),
                   (uv.x - 0.52) / 0.4), smoothstep(0.003, 0.0, rr));

    d = length(uv - float2(0.35, 0.8));
    t = smoothstep(0.12, 0.0, d);
    c = mix(c, mix(half3(0.93, 0.35, 0.14), half3(1.0, 0.62, 0.26), t),
            step(d, 0.12));

    d = length(uv - float2(0.7, 0.75));
    t = smoothstep(0.14, 0.0, d);
    c = mix(c, mix(half3(0.88, 0.34, 0.63), half3(0.95, 0.41, 0.88), t),
            step(d, 0.14));

    float gx = 1.0 - smoothstep(0.0, 0.005, abs(fract(uv.x * 8.0) - 0.5));
    float gy = 1.0 - smoothstep(0.0, 0.005, abs(fract(uv.y * 12.0) - 0.5));
    c += half3(max(gx, gy) * 0.06);

    return c;
}

half4 main(float2 fragCoord) {
    float2 uv = fragCoord / iResolution;
    float2 c  = center / iResolution;
    float  r  = radius / iResolution.x;
    float bevel = clamp(bevelPct, 0.05, 1.0);

    float2 delta = uv - c;
    float dist = length(delta);

    if (dist >= r) {
        return half4(scene(uv), 1.0);
    }

    float2 dir = delta / max(dist, 0.001);
    float edgeDist = (r - dist) / (r * bevel);
    float t = clamp(edgeDist, 0.0, 1.0);

    float slope = (1.0 - t) / max(sqrt(1.0 - (1.0 - t) * (1.0 - t)), 0.001);
    float bend  = slope * (1.0 - 1.0 / ior);
    float2 refracted = uv - dir * bend * r * bevel * 0.5;

    half3 col = scene(refracted);

    float normDist = dist / r;
    float fresnel = pow(normDist, 3.0) * 0.15;
    col += half3(fresnel);

    float edgeAA = smoothstep(r, r - 0.002, dist);
    half3 bg = scene(uv);
    col = mix(bg, col, edgeAA);

    return half4(col, 1.0);
}
`;

let _cached: SkRuntimeEffect | null = null;

export function getLensShader(): SkRuntimeEffect {
  if (!_cached) {
    _cached = Skia.RuntimeEffect.Make(LENS_SOURCE)!;
  }
  return _cached;
}
