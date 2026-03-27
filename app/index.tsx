import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

const DEMOS = [
  {
    title: "Interactive Liquid Glass",
    subtitle: "Move a lens around — chromatic aberration, blur & specular in real-time",
    route: "/interactive-lens" as const,
    color: "#ff6b6b",
  },
  {
    title: "Frosted Glass Panel",
    subtitle: "Move a squircle panel — backdrop blur, refraction & specular highlights",
    route: "/glass-panel" as const,
    color: "#a55eea",
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Liquid Glass</Text>
        <Text style={styles.heroSubtitle}>
          Reproducing Apple's iOS 26 lens effect{"\n"}with React Native & Skia
        </Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Demos</Text>

      {DEMOS.map((demo) => (
        <TouchableOpacity
          key={demo.route}
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => router.push(demo.route)}
        >
          <View style={[styles.cardAccent, { backgroundColor: demo.color }]} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{demo.title}</Text>
            <Text style={styles.cardSubtitle}>{demo.subtitle}</Text>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Built with @shopify/react-native-skia{"\n"}
          SkSL fragment shaders running on the GPU
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    paddingBottom: 60,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    overflow: "hidden",
  },
  cardAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  cardBody: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    marginTop: 4,
    lineHeight: 18,
  },
  cardArrow: {
    fontSize: 28,
    color: "rgba(255,255,255,0.25)",
    paddingRight: 16,
    fontWeight: "300",
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.25)",
    textAlign: "center",
    lineHeight: 18,
  },
});
