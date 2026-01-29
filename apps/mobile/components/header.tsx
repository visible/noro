import { type ReactNode } from "react";
import { View, Text, Pressable, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  back?: {
    label?: string;
    onPress: () => void;
  };
  actions?: ReactNode;
  transparent?: boolean;
  large?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Header({
  title,
  subtitle,
  back,
  actions,
  transparent = false,
  large = false,
  style,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          paddingTop: insets.top,
          backgroundColor: transparent ? "transparent" : "#0a0a0a",
          borderBottomWidth: transparent ? 0 : 1,
          borderBottomColor: "rgba(255,255,255,0.08)",
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: large ? 56 : 48,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          {back ? <BackButton label={back.label} onPress={back.onPress} /> : null}
          {!large && title ? (
            <Animated.Text
              entering={FadeIn.duration(200)}
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: "#ffffff",
                letterSpacing: -0.2,
                marginLeft: back ? 8 : 0,
              }}
              numberOfLines={1}
            >
              {title}
            </Animated.Text>
          ) : null}
        </View>
        {actions ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {actions}
          </View>
        ) : null}
      </View>
      {large && title ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Animated.Text
            entering={FadeIn.duration(200)}
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: "#ffffff",
              letterSpacing: -0.5,
            }}
          >
            {title}
          </Animated.Text>
          {subtitle ? (
            <Animated.Text
              entering={FadeIn.delay(100).duration(200)}
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.5)",
                marginTop: 4,
              }}
            >
              {subtitle}
            </Animated.Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

interface BackButtonProps {
  label?: string;
  onPress: () => void;
}

function BackButton({ label, onPress }: BackButtonProps) {
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

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingVertical: 8,
          paddingRight: 8,
          marginLeft: -8,
        },
        animatedStyle,
      ]}
    >
      <ChevronLeft />
      {label ? (
        <Text
          style={{
            fontSize: 17,
            color: "#d4b08c",
          }}
        >
          {label}
        </Text>
      ) : null}
    </AnimatedPressable>
  );
}

function ChevronLeft() {
  return (
    <View style={{ width: 24, height: 24 }}>
      <View
        style={{
          position: "absolute",
          width: 10,
          height: 2,
          backgroundColor: "#d4b08c",
          top: 8,
          left: 6,
          transform: [{ rotate: "-45deg" }],
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 10,
          height: 2,
          backgroundColor: "#d4b08c",
          top: 14,
          left: 6,
          transform: [{ rotate: "45deg" }],
          borderRadius: 1,
        }}
      />
    </View>
  );
}

interface HeaderButtonProps {
  icon: "plus" | "settings" | "search" | "close" | "edit";
  onPress: () => void;
  style?: ViewStyle;
}

export function HeaderButton({ icon, onPress, style }: HeaderButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        {
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: "rgba(255,255,255,0.08)",
          alignItems: "center",
          justifyContent: "center",
        },
        animatedStyle,
        style,
      ]}
    >
      <HeaderIcon name={icon} />
    </AnimatedPressable>
  );
}

interface HeaderIconProps {
  name: "plus" | "settings" | "search" | "close" | "edit";
}

function HeaderIcon({ name }: HeaderIconProps) {
  const color = "rgba(255,255,255,0.7)";
  const size = 18;

  const icons: Record<HeaderIconProps["name"], JSX.Element> = {
    plus: (
      <View style={{ width: size, height: size }}>
        <View
          style={{
            position: "absolute",
            width: size,
            height: 2,
            backgroundColor: color,
            top: size / 2 - 1,
            borderRadius: 1,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: 2,
            height: size,
            backgroundColor: color,
            left: size / 2 - 1,
            borderRadius: 1,
          }}
        />
      </View>
    ),
    settings: (
      <View style={{ width: size, height: size }}>
        <View
          style={{
            position: "absolute",
            width: size * 0.5,
            height: size * 0.5,
            borderWidth: 1.5,
            borderColor: color,
            borderRadius: size * 0.25,
            top: size * 0.25,
            left: size * 0.25,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: 2,
            height: size * 0.2,
            backgroundColor: color,
            top: 0,
            left: size / 2 - 1,
            borderRadius: 1,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: 2,
            height: size * 0.2,
            backgroundColor: color,
            bottom: 0,
            left: size / 2 - 1,
            borderRadius: 1,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size * 0.2,
            height: 2,
            backgroundColor: color,
            top: size / 2 - 1,
            left: 0,
            borderRadius: 1,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size * 0.2,
            height: 2,
            backgroundColor: color,
            top: size / 2 - 1,
            right: 0,
            borderRadius: 1,
          }}
        />
      </View>
    ),
    search: (
      <View style={{ width: size, height: size }}>
        <View
          style={{
            position: "absolute",
            width: size * 0.65,
            height: size * 0.65,
            borderWidth: 1.5,
            borderColor: color,
            borderRadius: size * 0.325,
            top: 0,
            left: 0,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size * 0.35,
            height: 1.5,
            backgroundColor: color,
            bottom: size * 0.1,
            right: 0,
            transform: [{ rotate: "45deg" }],
            borderRadius: 1,
          }}
        />
      </View>
    ),
    close: (
      <View style={{ width: size, height: size }}>
        <View
          style={{
            position: "absolute",
            width: size * 0.85,
            height: 2,
            backgroundColor: color,
            top: size / 2 - 1,
            left: size * 0.075,
            transform: [{ rotate: "45deg" }],
            borderRadius: 1,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size * 0.85,
            height: 2,
            backgroundColor: color,
            top: size / 2 - 1,
            left: size * 0.075,
            transform: [{ rotate: "-45deg" }],
            borderRadius: 1,
          }}
        />
      </View>
    ),
    edit: (
      <View style={{ width: size, height: size }}>
        <View
          style={{
            position: "absolute",
            width: size * 0.6,
            height: size * 0.6,
            borderWidth: 1.5,
            borderColor: color,
            borderRadius: 3,
            bottom: 0,
            left: 0,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size * 0.5,
            height: 1.5,
            backgroundColor: color,
            top: size * 0.2,
            right: size * 0.05,
            transform: [{ rotate: "-45deg" }],
            borderRadius: 1,
          }}
        />
      </View>
    ),
  };

  return icons[name];
}
