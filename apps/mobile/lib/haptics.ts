import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const isHapticsEnabled = Platform.OS === "ios" || Platform.OS === "android";

export const haptic = {
  light: () => {
    if (!isHapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  medium: () => {
    if (!isHapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  heavy: () => {
    if (!isHapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  soft: () => {
    if (!isHapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  },

  rigid: () => {
    if (!isHapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  },

  success: () => {
    if (!isHapticsEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  warning: () => {
    if (!isHapticsEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  error: () => {
    if (!isHapticsEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  selection: () => {
    if (!isHapticsEnabled) return;
    Haptics.selectionAsync();
  },

  tap: () => {
    if (!isHapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  press: () => {
    if (!isHapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  copy: () => {
    if (!isHapticsEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  delete: () => {
    if (!isHapticsEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  unlock: () => {
    if (!isHapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
} as const;
