import { Skia, SkRuntimeEffect } from "@shopify/react-native-skia";

/**
 * Frosted glass panel shader — fully self-contained.
 *
 * Generates a procedural background, then composites a squircle-shaped
 * frosted glass panel with refraction, blur and specular highlights.
 * Uses Shader paint (not image filter) so it works on web + native.
 *
 * Uniforms:
 *   iResolution – viewport size
 *   panelPos    – top-left of panel in pixels
 *   panelSize   – width/height of panel in pixels
 *   cornerN     – squircle exponent (4 = Apple style)
 *   bevelWidth  – pixel width of the refracting bevel
 *   ior         – index of refraction
 *   blurAmount  – frosted blur intensity (0..1)
 */
const FROSTED_GLASS_SOURCE = `
uniform float2 iResolution;
uniform float2 panelPos;
uniform float2 panelSize;
uniform float  cornerN;
uniform float  bevelWidth;
uniform float  ior;
uniform float  blurAmount;

half3 scene(float2 uv) {
    half3 c = mix(half3(0.102, 0.102, 0.18), half3(0.086, 0.129, 0.376),
                  uv.x * 0.5 + uv.y * 0.5);
    c = mix(c, half3(0.059, 0.2, 0.376), uv.y);

    float d; float t;

    d = length(uv - float2(0.2, 0.15));
    t = smoothstep(0.2, 0.0, d);
    c = mix(c, mix(half3(0.95, 0.49, 0.07), half3(0.91, 0.3, 0.24), t),
            step(d, 0.2));

    d = length(uv - float2(0.8, 0.3));
    t = smoothstep(0.15, 0.0, d);
    c = mix(c, mix(half3(0.18, 0.8, 0.44), half3(0.2, 0.6, 0.86), t),
            step(d, 0.15));

    float2 p = abs(uv - float2(0.25, 0.45)) - float2(0.15, 0.04);
    float rr = length(max(p, float2(0.0))) + min(max(p.x, p.y), 0.0) - 0.012;
    c = mix(c, mix(half3(0.61, 0.35, 0.71), half3(0.56, 0.27, 0.68),
                   (uv.x - 0.1) / 0.3), smoothstep(0.003, 0.0, rr));

    p = abs(uv - float2(0.72, 0.6)) - float2(0.2, 0.045);
    rr = length(max(p, float2(0.0))) + min(max(p.x, p.y), 0.0) - 0.015;
    c = mix(c, mix(half3(0.1, 0.74, 0.61), half3(0.09, 0.63, 0.52),
                   (uv.x - 0.52) / 0.4), smoothstep(0.003, 0.0, rr));

    d = length(uv - float2(0.4, 0.75));
    t = smoothstep(0.18, 0.0, d);
    c = mix(c, mix(half3(0.88, 0.34, 0.63), half3(0.95, 0.41, 0.88), t),
            step(d, 0.18));

    d = length(uv - float2(0.75, 0.82));
    t = smoothstep(0.1, 0.0, d);
    c = mix(c, mix(half3(0.99, 0.8, 0.43), half3(0.88, 0.44, 0.33), t),
            step(d, 0.1));

    float gx = 1.0 - smoothstep(0.0, 0.004, abs(fract(uv.x * 10.0) - 0.5));
    float gy = 1.0 - smoothstep(0.0, 0.004, abs(fract(uv.y * 15.0) - 0.5));
    c += half3(max(gx, gy) * 0.04);

    return c;
}

float sdSquircle(float2 p, float2 size, float n) {
    float2 d = abs(p) / size;
    float v  = pow(pow(d.x, n) + pow(d.y, n), 1.0 / n);
    return (v - 1.0) * min(size.x, size.y);
}

float2 sdSquircleGrad(float2 p, float2 size, float n) {
    float2 d = abs(p) / size;
    float sum = pow(d.x, n) + pow(d.y, n);
    float sp  = pow(sum, 1.0 / n - 1.0);
    float2 g  = sign(p) * pow(d, float2(n - 1.0)) / size * sp;
    float  gl = length(g);
    return gl > 0.001 ? g / gl : float2(0.0);
}

half3 blurScene(float2 uv, float spread) {
    half3 acc = half3(0.0);
    float total = 0.0;
    const int TAPS = 12;
    for (int i = 0; i < TAPS; i++) {
        float angle = float(i) * 6.2831853 / float(TAPS);
        float2 off = float2(cos(angle), sin(angle)) * spread;
        acc += scene(uv + off);
        total += 1.0;
    }
    acc += scene(uv) * 2.0;
    total += 2.0;
    return acc / total;
}

half4 main(float2 fragCoord) {
    float2 uv = fragCoord / iResolution;

    float2 panelCenter = (panelPos + panelSize * 0.5) / iResolution;
    float2 halfSize    = panelSize * 0.5 / iResolution;
    float2 local       = uv - panelCenter;

    float sdf = sdSquircle(local, halfSize, cornerN);

    if (sdf > 0.002) {
        return half4(scene(uv), 1.0);
    }

    float bevelPx = bevelWidth / iResolution.x;
    float bevelT  = 1.0 - clamp(-sdf / bevelPx, 0.0, 1.0);

    float2 grad = sdSquircleGrad(local, halfSize, cornerN);
    float slope = bevelT / max(sqrt(1.0 - bevelT * bevelT), 0.01);
    float bend  = slope * (1.0 - 1.0 / ior) * bevelPx * 0.5;
    float2 refractedUV = uv - grad * bend;

    float spread = blurAmount * 0.015 * (1.0 - bevelT * 0.5);
    half3 col = blurScene(refractedUV, spread);

    float specular = pow(bevelT, 3.0) * 0.6;
    float edgeAA = smoothstep(0.002, 0.0, sdf);

    col = mix(col, half3(1.0), 0.03);
    col += half3(specular);

    half3 bg = scene(uv);
    col = mix(bg, col, edgeAA);

    return half4(col, 1.0);
}
`;

let _cached: SkRuntimeEffect | null = null;

export function getFrostedGlassShader(): SkRuntimeEffect {
  if (!_cached) {
    _cached = Skia.RuntimeEffect.Make(FROSTED_GLASS_SOURCE)!;
  }
  return _cached;
}
