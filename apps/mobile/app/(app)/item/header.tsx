import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { TypeIcon, XIcon, ChevronRightIcon } from "../../../components/icons";
import { colors, typeColors } from "./constants";
import type { ItemType } from "../../../stores";

interface FormHeaderProps {
  type?: ItemType;
  title?: string;
  onClose: () => void;
  onSave?: () => void;
  saving?: boolean;
  saveDisabled?: boolean;
  showBack?: boolean;
  onBack?: () => void;
}

export function FormHeader({
  type,
  title,
  onClose,
  onSave,
  saving,
  saveDisabled,
  showBack,
  onBack,
}: FormHeaderProps) {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
      {showBack ? (
        <Pressable
          style={styles.button}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack?.();
          }}
          hitSlop={12}
        >
          <View style={{ transform: [{ rotate: "180deg" }] }}>
            <ChevronRightIcon size={24} color="rgba(255,255,255,0.6)" />
          </View>
        </Pressable>
      ) : (
        <Pressable
          style={styles.button}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
          hitSlop={12}
        >
          <XIcon size={24} color="rgba(255,255,255,0.6)" />
        </Pressable>
      )}

      <View style={styles.center}>
        {type ? (
          <View style={[styles.badge, { backgroundColor: typeColors[type] + "20" }]}>
            <TypeIcon type={type} size={16} color={typeColors[type]} />
            <Text style={[styles.badgeText, { color: typeColors[type] }]}>
              {title || type}
            </Text>
          </View>
        ) : (
          <Text style={styles.title}>{title || "new item"}</Text>
        )}
      </View>

      {onSave ? (
        <Pressable
          style={[styles.saveButton, saveDisabled && styles.saveButtonDisabled]}
          onPress={onSave}
          disabled={saveDisabled}
          hitSlop={12}
        >
          <Text style={styles.saveButtonText}>{saving ? "saving..." : "save"}</Text>
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.bg,
  },
  spacer: {
    width: 40,
  },
});
