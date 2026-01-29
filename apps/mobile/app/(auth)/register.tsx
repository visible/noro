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
import * as SecureStore from "expo-secure-store";
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
import Svg, { Path } from "react-native-svg";
import { Logo } from "../components/logo";
import { Input } from "../components/input";
import { Button } from "../components/button";

function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <View
      style={[
        styles.check,
        checked && styles.checkActive,
      ]}
    >
      {checked && (
        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
          <Path
            stroke="#0a0a0a"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 6 9 17l-5-5"
          />
        </Svg>
      )}
    </View>
  );
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const headerOpacity = useSharedValue(0);
  const headerScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(20);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    headerScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    contentTranslate.value = withDelay(200, withSpring(0, { damping: 20, stiffness: 150 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslate.value }],
  }));

  const hasLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password === confirm && password.length > 0;

  async function handleRegister() {
    setError("");

    if (!email) {
      setError("please enter your email");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!hasLength || !hasUpper || !hasLower || !hasNumber) {
      setError("password does not meet requirements");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!passwordsMatch) {
      setError("passwords do not match");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      await SecureStore.setItemAsync("session", "demo-session-token");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(auth)/unlock");
    } catch (e) {
      setError("failed to create account");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
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
            <Animated.View style={[styles.header, headerStyle]}>
              <View style={styles.logoContainer}>
                <Logo size={48} />
              </View>
              <Text style={styles.title}>create account</Text>
              <Text style={styles.subtitle}>secure your secrets with noro</Text>
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
                  label="master password"
                  placeholder="create a strong password"
                  type="password"
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="new-password"
                />
                <View style={styles.spacer} />
                <Input
                  label="confirm password"
                  placeholder="confirm your password"
                  type="password"
                  value={confirm}
                  onChangeText={setConfirm}
                  autoComplete="new-password"
                />

                <View style={styles.requirements}>
                  <View style={styles.requirement}>
                    <CheckIcon checked={hasLength} />
                    <Text style={[styles.requirementText, hasLength && styles.requirementMet]}>
                      12+ characters
                    </Text>
                  </View>
                  <View style={styles.requirement}>
                    <CheckIcon checked={hasUpper && hasLower} />
                    <Text style={[styles.requirementText, hasUpper && hasLower && styles.requirementMet]}>
                      uppercase & lowercase
                    </Text>
                  </View>
                  <View style={styles.requirement}>
                    <CheckIcon checked={hasNumber} />
                    <Text style={[styles.requirementText, hasNumber && styles.requirementMet]}>
                      number
                    </Text>
                  </View>
                  <View style={styles.requirement}>
                    <CheckIcon checked={hasSpecial} />
                    <Text style={[styles.requirementText, hasSpecial && styles.requirementMet]}>
                      special character
                    </Text>
                  </View>
                </View>

                {error && (
                  <Animated.View entering={FadeIn.duration(200)}>
                    <Text style={styles.error}>{error}</Text>
                  </Animated.View>
                )}

                <View style={styles.buttonSpacer} />
                <Button onPress={handleRegister} loading={loading}>
                  create account
                </Button>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>already have an account?</Text>
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={8}
                >
                  <Text style={styles.link}>sign in</Text>
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
  requirements: {
    marginTop: 16,
    gap: 8,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },
  requirementText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
  },
  requirementMet: {
    color: "rgba(255,255,255,0.8)",
  },
  error: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    marginTop: 16,
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
