import { forwardRef } from "react";
import { View, Text, Pressable, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type Status = "success" | "warning" | "error" | "info" | "neutral";
type Size = "sm" | "md";

interface BadgeProps {
  status?: Status;
  size?: Size;
  children: string;
  style?: ViewStyle;
}

const statusStyles: Record<Status, { bg: string; text: string; border: string }> = {
  success: {
    bg: "rgba(34,197,94,0.15)",
    text: "#4ade80",
    border: "rgba(34,197,94,0.3)",
  },
  warning: {
    bg: "rgba(234,179,8,0.15)",
    text: "#facc15",
    border: "rgba(234,179,8,0.3)",
  },
  error: {
    bg: "rgba(239,68,68,0.15)",
    text: "#f87171",
    border: "rgba(239,68,68,0.3)",
  },
  info: {
    bg: "rgba(59,130,246,0.15)",
    text: "#60a5fa",
    border: "rgba(59,130,246,0.3)",
  },
  neutral: {
    bg: "rgba(255,255,255,0.08)",
    text: "rgba(255,255,255,0.7)",
    border: "rgba(255,255,255,0.15)",
  },
};

const sizeStyles: Record<Size, { padding: { h: number; v: number }; text: number }> = {
  sm: { padding: { h: 8, v: 3 }, text: 11 },
  md: { padding: { h: 10, v: 4 }, text: 12 },
};

export const Badge = forwardRef<View, BadgeProps>(
  ({ status = "neutral", size = "md", children, style }, ref) => {
    const colors = statusStyles[status];
    const sizing = sizeStyles[size];

    return (
      <Animated.View
        ref={ref}
        entering={FadeIn.duration(200)}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 100,
            paddingHorizontal: sizing.padding.h,
            paddingVertical: sizing.padding.v,
          },
          style,
        ]}
      >
        <Text
          style={{
            fontSize: sizing.text,
            fontWeight: "500",
            color: colors.text,
          }}
        >
          {children}
        </Text>
      </Animated.View>
    );
  }
);

Badge.displayName = "Badge";

interface TagBadgeProps {
  children: string;
  onRemove?: () => void;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TagBadge({ children, onRemove, style }: TagBadgeProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }

  function handleRemove() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemove?.();
  }

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(212,176,140,0.15)",
          borderWidth: 1,
          borderColor: "rgba(212,176,140,0.3)",
          borderRadius: 8,
          paddingLeft: 10,
          paddingRight: onRemove ? 6 : 10,
          paddingVertical: 5,
          gap: 6,
        },
        animatedStyle,
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: "#d4b08c",
        }}
      >
        {children}
      </Text>
      {onRemove ? (
        <AnimatedPressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleRemove}
          hitSlop={4}
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            backgroundColor: "rgba(212,176,140,0.2)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#d4b08c", fontSize: 12, fontWeight: "600" }}>
            x
          </Text>
        </AnimatedPressable>
      ) : null}
    </Animated.View>
  );
}

interface TypeBadgeProps {
  type: "login" | "card" | "note" | "identity" | "custom";
  style?: ViewStyle;
}

const typeConfig: Record<
  TypeBadgeProps["type"],
  { label: string; color: string }
> = {
  login: { label: "Login", color: "#60a5fa" },
  card: { label: "Card", color: "#f472b6" },
  note: { label: "Note", color: "#a78bfa" },
  identity: { label: "Identity", color: "#4ade80" },
  custom: { label: "Custom", color: "#fbbf24" },
};

export function TypeBadge({ type, style }: TypeBadgeProps) {
  const config = typeConfig[type];

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: config.color,
        }}
      />
      <Text
        style={{
          fontSize: 12,
          fontWeight: "500",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        {config.label}
      </Text>
    </View>
  );
}
