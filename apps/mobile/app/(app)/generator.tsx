import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  Layout,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { Svg, Path, Rect, Circle } from "react-native-svg";

const colors = {
  bg: "#0a0a0a",
  accent: "#d4b08c",
  surface: "#141414",
  surfaceHover: "#1a1a1a",
  border: "#1f1f1f",
  text: "#ffffff",
  muted: "#666666",
  subtle: "#999999",
  weak: "#ef4444",
  medium: "#f59e0b",
  strong: "#22c55e",
};

type Mode = "random" | "passphrase" | "pin";

function CopyIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x={8} y={8} width={12} height={12} rx={2} stroke={colors.text} strokeWidth={1.5} />
      <Path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke={colors.text} strokeWidth={1.5} />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M5 13l4 4L19 7" stroke={colors.strong} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function RefreshIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12a8 8 0 018-8c2.6 0 4.9 1.2 6.4 3.1M20 12a8 8 0 01-8 8c-2.6 0-4.9-1.2-6.4-3.1"
        stroke={colors.text}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path d="M16 4l2.5 3.1L16 8" stroke={colors.text} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 20l-2.5-3.1L8 16" stroke={colors.text} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={colors.muted} strokeWidth={1.5} />
      <Path d="M12 7v5l3 3" stroke={colors.muted} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function calculateStrength(password: string, mode: Mode): { label: string; percent: number; color: string } {
  if (!password) return { label: "none", percent: 0, color: colors.muted };

  let entropy = 0;
  if (mode === "random") {
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;
    entropy = Math.log2(Math.pow(poolSize || 1, password.length));
  } else if (mode === "passphrase") {
    const words = password.split("-").length;
    entropy = words * 12.9;
  } else if (mode === "pin") {
    entropy = Math.log2(Math.pow(10, password.length));
  }

  if (entropy < 40) return { label: "weak", percent: 25, color: colors.weak };
  if (entropy < 60) return { label: "fair", percent: 50, color: colors.medium };
  if (entropy < 80) return { label: "good", percent: 75, color: colors.medium };
  return { label: "strong", percent: 100, color: colors.strong };
}

function generatePassword(
  mode: Mode,
  length: number,
  options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean }
): string {
  if (mode === "random") {
    let chars = "";
    if (options.uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (options.numbers) chars += "0123456789";
    if (options.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";

    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => chars[b % chars.length]).join("");
  }

  if (mode === "passphrase") {
    const words = [
      "apple", "banana", "cherry", "dragon", "eagle", "forest", "guitar", "harbor",
      "island", "jungle", "kitchen", "lemon", "mountain", "north", "ocean", "piano",
      "quantum", "river", "sunset", "thunder", "umbrella", "violet", "window", "yellow",
      "zebra", "anchor", "bridge", "castle", "dolphin", "engine", "falcon", "garden",
    ];
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => words[b % words.length]).join("-");
  }

  if (mode === "pin") {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => (b % 10).toString()).join("");
  }

  return "";
}

function ModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[styles.modeButton, active && styles.modeButtonActive]}
    >
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Toggle({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(!value);
      }}
      style={styles.toggleRow}
    >
      <View>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleSublabel}>{sublabel}</Text>
      </View>
      <View style={[styles.toggleTrack, value && styles.toggleTrackActive]}>
        <Animated.View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </View>
    </Pressable>
  );
}

function HistoryItem({
  password,
  onCopy,
}: {
  password: string;
  onCopy: () => void;
}) {
  return (
    <Animated.View entering={FadeIn.duration(150)} layout={Layout.springify()}>
      <Pressable
        onPress={onCopy}
        style={styles.historyItem}
      >
        <View style={styles.historyIcon}>
          <ClockIcon />
        </View>
        <Text style={styles.historyText} numberOfLines={1}>{password}</Text>
        <View style={styles.historyAction}>
          <CopyIcon />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function GeneratorScreen() {
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("random");
  const [length, setLength] = useState(24);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const strength = useMemo(() => calculateStrength(password, mode), [password, mode]);

  const minLength = mode === "passphrase" ? 3 : mode === "pin" ? 4 : 8;
  const maxLength = mode === "passphrase" ? 10 : mode === "pin" ? 12 : 64;
  const sliderPercent = ((length - minLength) / (maxLength - minLength)) * 100;

  const generate = useCallback(() => {
    if (password && !history.includes(password)) {
      setHistory((prev) => [password, ...prev].slice(0, 5));
    }
    const newPassword = generatePassword(mode, length, { uppercase, lowercase, numbers, symbols });
    setPassword(newPassword);
    setCopied(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [mode, length, uppercase, lowercase, numbers, symbols, password, history]);

  const copyToClipboard = useCallback(async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    if (newMode === "passphrase") setLength(5);
    else if (newMode === "pin") setLength(6);
    else setLength(24);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Generator</Text>
        <Text style={styles.subtitle}>Create secure passwords</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.outputCard}>
          <View style={styles.outputContent}>
            <Text style={styles.passwordText} selectable numberOfLines={3}>
              {password || "Tap generate to create"}
            </Text>
          </View>
          <View style={styles.outputActions}>
            <Pressable
              onPress={() => copyToClipboard(password)}
              disabled={!password}
              style={[styles.actionButton, !password && styles.actionButtonDisabled]}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </Pressable>
            <Pressable
              onPress={generate}
              style={styles.actionButton}
            >
              <RefreshIcon />
            </Pressable>
          </View>
          {password && (
            <View style={styles.strengthBar}>
              <View style={styles.strengthTrack}>
                <Animated.View
                  style={[
                    styles.strengthFill,
                    { width: `${strength.percent}%`, backgroundColor: strength.color },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingsSection}>
            <Text style={styles.sectionLabel}>Type</Text>
            <View style={styles.modeRow}>
              <ModeButton label="Random" active={mode === "random"} onPress={() => handleModeChange("random")} />
              <ModeButton label="Passphrase" active={mode === "passphrase"} onPress={() => handleModeChange("passphrase")} />
              <ModeButton label="PIN" active={mode === "pin"} onPress={() => handleModeChange("pin")} />
            </View>
          </View>

          <View style={styles.settingsSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>
                Length{mode === "passphrase" ? " (words)" : ""}
              </Text>
              <View style={styles.lengthBadge}>
                <Text style={styles.lengthText}>{length}</Text>
              </View>
            </View>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <Animated.View
                  style={[styles.sliderFill, { width: `${sliderPercent}%` }]}
                />
              </View>
              <Animated.View
                style={[
                  styles.sliderThumb,
                  { left: `${sliderPercent}%`, marginLeft: -12 },
                ]}
              />
              <Pressable
                style={styles.sliderHitArea}
                onPressIn={(e) => {
                  const { locationX } = e.nativeEvent;
                  const percent = Math.max(0, Math.min(100, (locationX / 280) * 100));
                  const newLength = Math.round(minLength + (percent / 100) * (maxLength - minLength));
                  setLength(newLength);
                  Haptics.selectionAsync();
                }}
              />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>{minLength}</Text>
              <Text style={styles.sliderLabel}>{maxLength}</Text>
            </View>
          </View>

          {mode === "random" && (
            <View style={styles.settingsSection}>
              <Text style={styles.sectionLabel}>Include</Text>
              <View style={styles.toggleGrid}>
                <Toggle
                  label="A-Z"
                  sublabel="uppercase"
                  value={uppercase}
                  onChange={setUppercase}
                />
                <Toggle
                  label="a-z"
                  sublabel="lowercase"
                  value={lowercase}
                  onChange={setLowercase}
                />
                <Toggle
                  label="0-9"
                  sublabel="numbers"
                  value={numbers}
                  onChange={setNumbers}
                />
                <Toggle
                  label="!@#"
                  sublabel="symbols"
                  value={symbols}
                  onChange={setSymbols}
                />
              </View>
            </View>
          )}
        </View>

        <Pressable
          onPress={generate}
          style={({ pressed }) => [styles.generateButton, pressed && styles.generateButtonPressed]}
        >
          <Text style={styles.generateButtonText}>Generate Password</Text>
        </Pressable>

        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Recent</Text>
            <View style={styles.historyList}>
              {history.map((pw, i) => (
                <HistoryItem
                  key={`${pw}-${i}`}
                  password={pw}
                  onCopy={() => copyToClipboard(pw)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  outputCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 16,
  },
  outputContent: {
    minHeight: 60,
    justifyContent: "center",
  },
  passwordText: {
    fontSize: 18,
    fontFamily: "monospace",
    color: colors.text,
    lineHeight: 28,
  },
  outputActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonDisabled: {
    opacity: 0.3,
  },
  strengthBar: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  strengthTrack: {
    height: 4,
    backgroundColor: colors.bg,
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 8,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 24,
    marginBottom: 16,
  },
  settingsSection: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.bg,
  },
  modeButtonActive: {
    backgroundColor: colors.accent,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.subtle,
  },
  modeButtonTextActive: {
    color: colors.bg,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lengthBadge: {
    backgroundColor: colors.bg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lengthText: {
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "600",
    color: colors.text,
  },
  sliderContainer: {
    height: 24,
    justifyContent: "center",
    position: "relative",
  },
  sliderTrack: {
    height: 4,
    backgroundColor: colors.bg,
    borderRadius: 2,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  sliderThumb: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderHitArea: {
    ...StyleSheet.absoluteFillObject,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  toggleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 14,
    width: "48%",
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "600",
    color: colors.text,
  },
  toggleSublabel: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    padding: 2,
    justifyContent: "center",
  },
  toggleTrackActive: {
    backgroundColor: colors.accent,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.text,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  generateButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  generateButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.bg,
  },
  historySection: {
    marginTop: 8,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  historyList: {
    gap: 6,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  historyIcon: {
    opacity: 0.6,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "monospace",
    color: colors.muted,
  },
  historyAction: {
    opacity: 0.6,
  },
});
