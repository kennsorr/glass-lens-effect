import React from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Platform, Text, TouchableOpacity } from "react-native";

function Wrapper({ children }: { children: React.ReactNode }) {
  if (Platform.OS === "web") {
    return <View style={styles.root}>{children}</View>;
  }
  const { GestureHandlerRootView } = require("react-native-gesture-handler");
  return <GestureHandlerRootView style={styles.root}>{children}</GestureHandlerRootView>;
}

function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
      <Text style={styles.backText}>‹ Back</Text>
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  return (
    <Wrapper>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0a0a0a" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600", color: "#fff" },
          contentStyle: { backgroundColor: "#0a0a0a" },
          animation: "slide_from_right",
          headerLeft: Platform.OS === "web" ? () => <BackButton /> : undefined,
        }}
      >
        <Stack.Screen name="index" options={{ headerLeft: () => null }} />
      </Stack>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a0a" },
  backButton: { paddingHorizontal: 8, paddingVertical: 4 },
  backText: { color: "#fff", fontSize: 18, fontWeight: "500" },
});
