import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "../_components/logo";
import { Input } from "../_components/input";
import { Button } from "../_components/button";
import { FaceIdIcon, FingerprintIcon } from "../_components/icons";

export default function Unlock() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<"faceid" | "fingerprint">("fingerprint");

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(20);
  const shake = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    contentTranslate.value = withDelay(200, withSpring(0, { damping: 20, stiffness: 150 }));

    checkBiometrics();
  }, []);

  async function checkBiometrics() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const biometricEnabled = await SecureStore.getItemAsync("biometric");

    if (compatible && enrolled) {
      setBiometricAvailable(true);
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType("faceid");
      }

      if (biometricEnabled === "true") {
        promptBiometric();
      }
    }
  }

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslate.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const promptBiometric = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "unlock noro",
      fallbackLabel: "use password",
      cancelLabel: "cancel",
    });

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(app)");
    }
  }, []);

  async function handleUnlock() {
    setError("");
    if (!password) {
      setError("please enter your password");
      shake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(app)");
    } catch (e) {
      setError("incorrect password");
      shake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert(
      "sign out",
      "are you sure you want to sign out?",
      [
        { text: "cancel", style: "cancel" },
        {
          text: "sign out",
          style: "destructive",
          onPress: async () => {
            await SecureStore.deleteItemAsync("session");
            await SecureStore.deleteItemAsync("biometric");
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  }

  async function toggleBiometric() {
    const current = await SecureStore.getItemAsync("biometric");
    if (current === "true") {
      await SecureStore.setItemAsync("biometric", "false");
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "enable biometric unlock",
      });
      if (result.success) {
        await SecureStore.setItemAsync("biometric", "true");
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View style={[styles.header, logoStyle]}>
          <View style={styles.logoContainer}>
            <Logo size={48} />
          </View>
          <Text style={styles.title}>unlock vault</Text>
          <Text style={styles.subtitle}>enter your password to continue</Text>
        </Animated.View>

        <Animated.View style={[styles.form, contentStyle]}>
          <Animated.View style={[styles.card, cardStyle]}>
            <Input
              label="password"
              placeholder="enter your password"
              type="password"
              value={password}
              onChangeText={setPassword}
              autoComplete="password"
              error={error}
            />

            <View style={styles.buttonSpacer} />
            <Button onPress={handleUnlock} loading={loading}>
              unlock
            </Button>

            {biometricAvailable && (
              <Pressable
                onPress={promptBiometric}
                style={styles.biometric}
                hitSlop={16}
              >
                <View style={styles.biometricIcon}>
                  {biometricType === "faceid" ? (
                    <FaceIdIcon size={36} color="#FF6B00" />
                  ) : (
                    <FingerprintIcon size={36} color="#FF6B00" />
                  )}
                </View>
                <Text style={styles.biometricText}>
                  {biometricType === "faceid" ? "use face id" : "use fingerprint"}
                </Text>
              </Pressable>
            )}
          </Animated.View>

          <View style={styles.footer}>
            <Pressable onPress={handleLogout} hitSlop={8}>
              <Text style={styles.link}>sign out</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(255,107,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.5)",
  },
  form: {
    width: "100%",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  buttonSpacer: {
    height: 24,
  },
  biometric: {
    alignItems: "center",
    marginTop: 28,
    gap: 12,
  },
  biometricIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(255,107,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  biometricText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  link: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "500",
  },
});
