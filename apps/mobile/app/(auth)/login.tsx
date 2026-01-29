import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "../components/logo";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { FaceIdIcon, FingerprintIcon } from "../components/icons";
import { api } from "../../lib/api";
import { settoken, gettoken } from "../../lib/storage";
import { useauth } from "../../stores/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<"faceid" | "fingerprint">("fingerprint");

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(20);

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
    const token = await gettoken();

    if (compatible && enrolled && token) {
      setBiometricAvailable(true);
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType("faceid");
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

  async function handleLogin() {
    setError("");
    if (!email || !password) {
      setError("please enter your email and password");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.login(email, password);
      await settoken(response.session.token);
      useauth.getState().login(response.user, response.session.token);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(app)");
    } catch (e) {
      setError("invalid email or password");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  async function handleBiometric() {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "unlock noro",
      fallbackLabel: "use password",
    });

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(auth)/unlock");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Animated.View style={[styles.header, logoStyle]}>
              <View style={styles.logoContainer}>
                <Logo size={48} />
              </View>
              <Text style={styles.title}>welcome back</Text>
              <Text style={styles.subtitle}>sign in to your noro account</Text>
            </Animated.View>

            <Animated.View style={[styles.form, contentStyle]}>
              <View style={styles.card}>
                <Input
                  label="email"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChangeText={setEmail}
                  autoComplete="email"
                />
                <View style={styles.spacer} />
                <Input
                  label="password"
                  placeholder="enter your password"
                  type="password"
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="password"
                />

                {error && (
                  <Animated.View entering={FadeIn.duration(200)}>
                    <Text style={styles.error}>{error}</Text>
                  </Animated.View>
                )}

                <View style={styles.buttonSpacer} />
                <Button onPress={handleLogin} loading={loading}>
                  sign in
                </Button>

                {biometricAvailable && (
                  <Pressable
                    onPress={handleBiometric}
                    style={styles.biometric}
                    hitSlop={16}
                  >
                    {biometricType === "faceid" ? (
                      <FaceIdIcon size={28} color="rgba(255,255,255,0.6)" />
                    ) : (
                      <FingerprintIcon size={28} color="rgba(255,255,255,0.6)" />
                    )}
                    <Text style={styles.biometricText}>
                      {biometricType === "faceid" ? "face id" : "fingerprint"}
                    </Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>don't have an account?</Text>
                <Pressable
                  onPress={() => router.push("/(auth)/register")}
                  hitSlop={8}
                >
                  <Text style={styles.link}>create account</Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
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
  spacer: {
    height: 16,
  },
  buttonSpacer: {
    height: 24,
  },
  error: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    marginTop: 16,
  },
  biometric: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 12,
    gap: 10,
  },
  biometricText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },
  link: {
    fontSize: 14,
    color: "#FF6B00",
    fontWeight: "600",
  },
});
