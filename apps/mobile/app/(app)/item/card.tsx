import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CopyIcon, EyeIcon, EyeSlashIcon, CheckIcon } from "../../../components/icons";
import { colors } from "./constants";

interface FieldCardProps {
  index: number;
  label: string;
  value: string;
  isSecret: boolean;
  isVisible: boolean;
  isCopied: boolean;
  onToggle: () => void;
  onCopy: () => void;
  multiline: boolean;
}

export function FieldCard({ index, label, value, isSecret, isVisible, isCopied, onToggle, onCopy, multiline }: FieldCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(350 + index * 50).duration(300)} style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={styles.value} numberOfLines={multiline ? 0 : 1}>
          {isSecret && !isVisible ? "••••••••" : value}
        </Text>
        <View style={styles.actions}>
          {isSecret && (
            <Pressable style={styles.button} onPress={onToggle} hitSlop={8}>
              {isVisible ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
            </Pressable>
          )}
          <Pressable style={styles.button} onPress={onCopy} hitSlop={8}>
            {isCopied ? <CheckIcon size={16} color="#22c55e" /> : <CopyIcon size={18} />}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.muted,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
});
