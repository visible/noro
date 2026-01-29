import { forwardRef } from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: string;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const variants: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: "#d4b08c" },
    text: { color: "#0a0a0a" },
  },
  secondary: {
    container: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.2)",
    },
    text: { color: "#ffffff" },
  },
  ghost: {
    container: { backgroundColor: "transparent" },
    text: { color: "rgba(255,255,255,0.7)" },
  },
};

const sizes: Record<Size, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { height: 36, paddingHorizontal: 14, borderRadius: 8 },
    text: { fontSize: 13, fontWeight: "500" },
  },
  md: {
    container: { height: 44, paddingHorizontal: 18, borderRadius: 10 },
    text: { fontSize: 15, fontWeight: "600" },
  },
  lg: {
    container: { height: 52, paddingHorizontal: 24, borderRadius: 12 },
    text: { fontSize: 16, fontWeight: "600" },
  },
};

export const Button = forwardRef<typeof Pressable, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      onPressIn,
      onPressOut,
      onPress,
      style,
      ...props
    },
    ref
  ) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    function handlePressIn(e: any) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
      opacity.value = withTiming(0.9, { duration: 100 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPressIn?.(e);
    }

    function handlePressOut(e: any) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      opacity.value = withTiming(1, { duration: 100 });
      onPressOut?.(e);
    }

    function handlePress(e: any) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress?.(e);
    }

    const isDisabled = disabled || loading;
    const variantStyle = variants[variant];
    const sizeStyle = sizes[size];

    return (
      <AnimatedPressable
        ref={ref as any}
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          },
          variantStyle.container,
          sizeStyle.container,
          isDisabled && { opacity: 0.5 },
          animatedStyle,
          style,
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? "#0a0a0a" : "#ffffff"}
            style={{ marginRight: 8 }}
          />
        ) : null}
        <Text style={[variantStyle.text, sizeStyle.text]}>{children}</Text>
      </AnimatedPressable>
    );
  }
);

Button.displayName = "Button";
