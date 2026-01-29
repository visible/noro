import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: styles.content,
        animation: "slide_from_right",
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: "#0a0a0a",
  },
});
