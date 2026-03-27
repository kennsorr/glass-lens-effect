import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Platform } from "react-native";

function Wrapper({ children }: { children: React.ReactNode }) {
  if (Platform.OS === "web") {
    return <View style={styles.root}>{children}</View>;
  }
  const { GestureHandlerRootView } = require("react-native-gesture-handler");
  return <GestureHandlerRootView style={styles.root}>{children}</GestureHandlerRootView>;
}

export default function RootLayout() {
  return (
    <Wrapper>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0a0a0a" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: "#0a0a0a" },
          animation: "slide_from_right",
        }}
      />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a0a" },
});
