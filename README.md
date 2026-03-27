# Liquid Glass — Lens Effect Demo

A React Native + Expo project demonstrating how to reproduce Apple's **Liquid Glass** (iOS 26) lens effect using GPU-accelerated SkSL shaders via `@shopify/react-native-skia`.

**[Live Demo](https://kennsorr.github.io/glass-lens-effect/)** — runs in the browser via CanvasKit WASM

## What's Inside

Two interactive demos — move your mouse (or finger) to control the lens in real-time. Click to pin/unpin.

### 1. Interactive Liquid Glass
A movable magnifying lens combining all of Apple's Liquid Glass techniques:
- **Snell's Law refraction** — convex lens bending via `n₁sin(θ₁) = n₂sin(θ₂)`
- **Chromatic aberration** — R/G/B channels refract at different strengths
- **Frosted blur** — multi-tap sampling softens the refracted image
- **Specular highlights** — Fresnel-like rim light at grazing angles

### 2. Frosted Glass Panel
A movable squircle-shaped panel (Apple's signature superellipse, `|x/a|ⁿ + |y/b|ⁿ = 1`) with:
- **SDF-driven bevel refraction** along the edges
- **Multi-tap frosted blur** simulating translucent glass
- **Specular rim highlights** using Fresnel approximation

## Tech Stack

| Library | Purpose |
|---|---|
| `expo` + `expo-router` | Project framework & file-based routing |
| `@shopify/react-native-skia` | GPU-accelerated 2D graphics & SkSL shaders |
| `react-native-reanimated` | UI-thread shared values for gesture → shader pipeline |
| `react-native-gesture-handler` | Touch/drag gesture recognition |

## Getting Started

```bash
# Install dependencies
npm install

# Install Skia native binaries (requires disk space for prebuilt libs)
# If you skipped this during install, run:
cd node_modules/@shopify/react-native-skia && node scripts/install-skia.mjs

# Start the dev server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

## Project Structure

```
├── app/
│   ├── _layout.tsx          # Root layout (Stack navigator, dark theme)
│   ├── index.tsx            # Home screen with demo links
│   ├── interactive-lens.tsx # Interactive liquid glass lens
│   └── glass-panel.tsx      # Interactive frosted squircle panel
├── shaders/
│   ├── liquidGlass.ts       # Full liquid glass SkSL shader
│   └── frostedGlass.ts      # Frosted glass panel SkSL shader
├── components/
│   ├── ControlSlider.tsx     # Labeled parameter slider
│   └── SkiaWeb.tsx           # CanvasKit WASM loader for web
├── public/
│   └── canvaskit.wasm        # CanvasKit WASM binary for web
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions → GitHub Pages
```

## The Physics

The core of the lens effect is **Snell's Law**: when light crosses a boundary between materials with different refractive indices, it bends. A convex glass surface (IOR ≈ 1.5) bends light inward at the edges where the surface slopes, creating a magnification-like distortion. The flat center has minimal refraction.

Apple's Liquid Glass adds **chromatic dispersion** (different wavelengths bend differently, creating rainbow fringes), **frosted blur** (Gaussian-like multi-tap sampling), and **specular highlights** (Fresnel reflection at grazing angles).

## Note on Skia Binaries

The `@shopify/react-native-skia` package downloads ~1GB of prebuilt native binaries during installation. If you're short on disk space, you can install with `--ignore-scripts` and download them later, or build from source during `npx expo prebuild`.
