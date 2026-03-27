import { Skia, SkRuntimeEffect } from "@shopify/react-native-skia";

/**
 * Full Liquid Glass shader — the interactive draggable lens.
 *
 * Self-contained: generates a procedural background and composites a
 * movable lens with refraction, chromatic aberration, frosted blur
 * and specular highlights. Uses Shader paint (works on web + native).
 *
 * Uniforms:
 *   iResolution – viewport size
 *   iMouse      – current lens position (from gesture)
 *   lensRadius  – radius in pixels
 *   ior         – index of refraction
 *   bevelPct    – bevel width as fraction of radius
 *   dispersion  – chromatic aberration strength
 *   blurAmount  – frosted blur intensity
 *   specPower   – specular highlight sharpness
 *   lightAngle  – direction of virtual light source (radians)
 */
const LIQUID_GLASS_SOURCE = `
uniform float2 iResolution;
uniform float2 iMouse;
uniform float  lensRadius;
uniform float  ior;
uniform float  bevelPct;
uniform float  dispersion;
uniform float  blurAmount;
uniform float  specPower;
uniform float  lightAngle;

half3 scene(float2 uv) {
    half3 c = mix(half3(0.059, 0.047, 0.161), half3(0.188, 0.169, 0.388),
                  uv.x * 0.6 + uv.y * 0.4);
    c = mix(c, half3(0.141, 0.141, 0.243), uv.y);

    float d; float t;

    d = length(uv - float2(0.18, 0.12));
    t = smoothstep(0.22, 0.0, d);
    c = mix(c, mix(half3(0.99, 0.79, 0.34), half3(1.0, 0.42, 0.42), t),
            step(d, 0.22));

    d = length(uv - float2(0.82, 0.2));
    t = smoothstep(0.16, 0.0, d);
    c = mix(c, mix(half3(0.04, 0.74, 0.89), half3(0.28, 0.86, 0.98), t),
            step(d, 0.16));

    float2 p = abs(uv - float2(0.27, 0.4)) - float2(0.19, 0.04);
    float rr = length(max(p, float2(0.0))) + min(max(p.x, p.y), 0.0) - 0.015;
    c = mix(c, mix(half3(0.18, 0.84, 0.45), half3(0.48, 0.93, 0.62),
                   (uv.x - 0.08) / 0.38), smoothstep(0.003, 0.0, rr));

    p = abs(uv - float2(0.5, 0.52)) - float2(0.38, 0.03);
    rr = length(max(p, float2(0.0))) + min(max(p.x, p.y), 0.0) - 0.02;
    c = mix(c, mix(half3(0.65, 0.37, 0.92), half3(0.53, 0.33, 0.82),
                   (uv.x - 0.12) / 0.76), smoothstep(0.003, 0.0, rr));

    d = length(uv - float2(0.72, 0.65));
    t = smoothstep(0.14, 0.0, d);
    c = mix(c, mix(half3(0.93, 0.35, 0.14), half3(1.0, 0.62, 0.26), t),
            step(d, 0.14));

    p = abs(uv - float2(0.37, 0.77)) - float2(0.22, 0.025);
    rr = length(max(p, float2(0.0))) + min(max(p.x, p.y), 0.0) - 0.015;
    c = mix(c, mix(half3(0.0, 0.82, 0.83), half3(0.004, 0.64, 0.64),
                   (uv.x - 0.15) / 0.44), smoothstep(0.003, 0.0, rr));

    d = length(uv - float2(0.25, 0.85));
    t = smoothstep(0.11, 0.0, d);
    c = mix(c, mix(half3(0.88, 0.34, 0.63), half3(0.95, 0.41, 0.88), t),
            step(d, 0.11));

    float gx = 1.0 - smoothstep(0.0, 0.005, abs(fract(uv.x * 10.0) - 0.5));
    float gy = 1.0 - smoothstep(0.0, 0.005, abs(fract(uv.y * 16.0) - 0.5));
    c += half3(max(gx, gy) * 0.05);

    return c;
}

float surfaceSlope(float t) {
    float cl = clamp(t, 0.001, 0.999);
    return (1.0 - cl) / max(sqrt(1.0 - (1.0 - cl) * (1.0 - cl)), 0.001);
}

float2 refractUV(float2 uv, float2 c, float r, float bevel, float n) {
    float2 delta = uv - c;
    float dist   = length(delta);
    if (dist > r || dist < 0.001) return uv;
    float2 dir     = delta / dist;
    float edgeDist = (r - dist) / (r * bevel);
    float t        = clamp(edgeDist, 0.0, 1.0);
    float slope    = surfaceSlope(t);
    float bend     = slope * (1.0 - 1.0 / n) * r * bevel * 0.5;
    return uv - dir * bend;
}

half3 blurScene(float2 uv, float spread) {
    if (spread < 0.0001) return scene(uv);
    half3 acc = half3(0.0);
    float total = 0.0;
    const int TAPS = 8;
    for (int i = 0; i < TAPS; i++) {
        float a = float(i) * 6.2831853 / float(TAPS);
        float2 off = float2(cos(a), sin(a)) * spread;
        acc += scene(uv + off);
        total += 1.0;
    }
    acc += scene(uv) * 2.0;
    total += 2.0;
    return acc / total;
}

half4 main(float2 fragCoord) {
    float2 uv = fragCoord / iResolution;
    float2 c  = iMouse / iResolution;
    float  r  = lensRadius / iResolution.x;
    float bevel = clamp(bevelPct, 0.05, 1.0);

    float2 delta = uv - c;
    float dist   = length(delta);

    if (dist > r) {
        return half4(scene(uv), 1.0);
    }

    float edgeDist = (r - dist) / (r * bevel);
    float t = clamp(edgeDist, 0.0, 1.0);
    float edgeFactor = 1.0 - t;

    float2 dir = dist > 0.001 ? delta / dist : float2(0.0);

    float iorR = ior - dispersion * 0.02;
    float iorG = ior;
    float iorB = ior + dispersion * 0.02;

    float2 uvR = refractUV(uv, c, r, bevel, iorR);
    float2 uvG = refractUV(uv, c, r, bevel, iorG);
    float2 uvB = refractUV(uv, c, r, bevel, iorB);

    float spread = blurAmount * 0.008 * (1.0 - edgeFactor * 0.3);

    half3 colR = blurScene(uvR, spread);
    half3 colG = blurScene(uvG, spread);
    half3 colB = blurScene(uvB, spread);

    half3 col = half3(colR.r, colG.g, colB.b);

    float luma = dot(col, half3(0.299, 0.587, 0.114));
    col = mix(half3(luma), col, 1.15);

    float2 lightDir = float2(cos(lightAngle), sin(lightAngle));
    float spec = pow(max(dot(dir, lightDir), 0.0), specPower) * edgeFactor;
    float rim = pow(edgeFactor, 2.5) * 0.4;
    col += half3(spec * 0.5 + rim);

    float centerDim = 1.0 - (1.0 - edgeFactor) * 0.05;
    col *= centerDim;

    float edgeAA = smoothstep(r, r - 0.003, dist);
    half3 bg = scene(uv);
    col = mix(bg, col, edgeAA);

    return half4(col, 1.0);
}
`;

let _cached: SkRuntimeEffect | null = null;

export function getLiquidGlassShader(): SkRuntimeEffect {
  if (!_cached) {
    _cached = Skia.RuntimeEffect.Make(LIQUID_GLASS_SOURCE)!;
  }
  return _cached;
}
