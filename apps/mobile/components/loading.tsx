import { useEffect } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

type Size = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: Size;
  color?: string;
  style?: ViewStyle;
}

const sizes: Record<Size, number> = {
  sm: 18,
  md: 24,
  lg: 32,
};

export function Spinner({
  size = "md",
  color = "#d4b08c",
  style,
}: SpinnerProps) {
  const rotation = useSharedValue(0);
  const dimension = sizes[size];

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: dimension,
          height: dimension,
          alignItems: "center",
          justifyContent: "center",
        },
        animatedStyle,
        style,
      ]}
    >
      <View
        style={{
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          borderWidth: 2,
          borderColor: `${color}30`,
          borderTopColor: color,
        }}
      />
    </Animated.View>
  );
}

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: "rgba(255,255,255,0.15)",
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  style?: ViewStyle;
}

export function SkeletonText({ lines = 1, style }: SkeletonTextProps) {
  return (
    <View style={[{ gap: 8 }, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 && lines > 1 ? "75%" : "100%"}
          height={14}
        />
      ))}
    </View>
  );
}

interface SkeletonAvatarProps {
  size?: Size;
  style?: ViewStyle;
}

const avatarSizes: Record<Size, number> = {
  sm: 32,
  md: 40,
  lg: 52,
};

export function SkeletonAvatar({ size = "md", style }: SkeletonAvatarProps) {
  const dimension = avatarSizes[size];
  return (
    <Skeleton
      width={dimension}
      height={dimension}
      radius={dimension / 2}
      style={style}
    />
  );
}

interface SkeletonCardProps {
  style?: ViewStyle;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: "rgba(255,255,255,0.03)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 16,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <SkeletonAvatar size="md" />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <View style={{ marginTop: 16, gap: 8 }}>
        <Skeleton height={12} />
        <Skeleton width="80%" height={12} />
      </View>
    </View>
  );
}

interface LoadingDotsProps {
  size?: Size;
  color?: string;
  style?: ViewStyle;
}

const dotSizes: Record<Size, number> = {
  sm: 6,
  md: 8,
  lg: 10,
};

export function LoadingDots({
  size = "md",
  color = "#d4b08c",
  style,
}: LoadingDotsProps) {
  const dot1 = useSharedValue(1);
  const dot2 = useSharedValue(1);
  const dot3 = useSharedValue(1);
  const dotSize = dotSizes[size];

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 300 }),
        withTiming(1, { duration: 300 })
      ),
      -1
    );
    dot2.value = withDelay(
      150,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1
      )
    );
    dot3.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1
      )
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot1.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot2.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot3.value }],
  }));

  return (
    <View style={[{ flexDirection: "row", gap: dotSize * 0.8 }, style]}>
      <Animated.View
        style={[
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
          },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
          },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
          },
          dot3Style,
        ]}
      />
    </View>
  );
}
