import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CopyIcon, CheckIcon } from "../../../components/icons";
import { colors } from "./constants";

interface TotpSectionProps {
  code: string;
  remaining: number;
  onCopy: () => void;
  copied: boolean;
}

export function TotpSection({ code, remaining, onCopy, copied }: TotpSectionProps) {
  return (
    <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.label}>one-time code</Text>
        <View style={styles.timer}>
          <View style={[styles.timerBar, { width: `${(remaining / 30) * 100}%` }]} />
        </View>
        <Text style={styles.timerText}>{remaining}s</Text>
      </View>
      <Pressable style={styles.card} onPress={onCopy}>
        <Text style={styles.code}>{code}</Text>
        {copied ? <CheckIcon size={20} color="#22c55e" /> : <CopyIcon size={20} color="rgba(255,255,255,0.4)" />}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timer: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    marginLeft: 12,
    overflow: "hidden",
  },
  timerBar: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  timerText: {
    fontSize: 12,
    color: colors.muted,
    marginLeft: 8,
    width: 24,
    textAlign: "right",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  code: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 8,
    fontVariant: ["tabular-nums"],
  },
});
