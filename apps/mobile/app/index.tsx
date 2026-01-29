import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Logo } from "./_components/logo";
import { gettoken } from "../lib/storage";
import { api } from "../lib/api";

export default function Splash() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });

    checkAuth();
  }, []);

  async function checkAuth() {
    await new Promise((r) => setTimeout(r, 1200));

    const token = await gettoken();

    if (!token) {
      router.replace("/(auth)/login");
      return;
    }

    try {
      await api.auth.session();
      router.replace("/(auth)/unlock");
    } catch {
      router.replace("/(auth)/login");
    }
  }

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Logo size={80} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0a0a",
  },
});
