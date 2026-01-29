import { forwardRef, useMemo } from "react";
import { View, Text, Image, type ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name?: string;
  image?: string;
  size?: Size;
  style?: ViewStyle;
}

const sizes: Record<Size, { container: number; text: number }> = {
  xs: { container: 24, text: 10 },
  sm: { container: 32, text: 12 },
  md: { container: 40, text: 14 },
  lg: { container: 52, text: 18 },
  xl: { container: 72, text: 24 },
};

const colors = [
  "#d4b08c",
  "#8cd4b0",
  "#b08cd4",
  "#d48c8c",
  "#8cb0d4",
  "#d4c08c",
  "#8cd4d4",
  "#d48cc0",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const Avatar = forwardRef<View, AvatarProps>(
  ({ name = "", image, size = "md", style }, ref) => {
    const sizeConfig = sizes[size];
    const initials = useMemo(() => (name ? getInitials(name) : "?"), [name]);
    const backgroundColor = useMemo(
      () => (name ? getColor(name) : colors[0]),
      [name]
    );

    if (image) {
      return (
        <Animated.View
          ref={ref}
          entering={FadeIn.duration(200)}
          style={[
            {
              width: sizeConfig.container,
              height: sizeConfig.container,
              borderRadius: sizeConfig.container / 2,
              overflow: "hidden",
              backgroundColor: "rgba(255,255,255,0.1)",
            },
            style,
          ]}
        >
          <Image
            source={{ uri: image }}
            style={{
              width: sizeConfig.container,
              height: sizeConfig.container,
            }}
            resizeMode="cover"
          />
        </Animated.View>
      );
    }

    return (
      <Animated.View
        ref={ref}
        entering={FadeIn.duration(200)}
        style={[
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderRadius: sizeConfig.container / 2,
            backgroundColor,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <Text
          style={{
            fontSize: sizeConfig.text,
            fontWeight: "600",
            color: "#0a0a0a",
            letterSpacing: -0.3,
          }}
        >
          {initials}
        </Text>
      </Animated.View>
    );
  }
);

Avatar.displayName = "Avatar";

interface AvatarGroupProps {
  avatars: Array<{ name?: string; image?: string }>;
  max?: number;
  size?: Size;
  style?: ViewStyle;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = "sm",
  style,
}: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const sizeConfig = sizes[size];
  const overlap = sizeConfig.container * 0.3;

  return (
    <View style={[{ flexDirection: "row" }, style]}>
      {visible.map((avatar, i) => (
        <View
          key={i}
          style={{
            marginLeft: i === 0 ? 0 : -overlap,
            borderWidth: 2,
            borderColor: "#0a0a0a",
            borderRadius: sizeConfig.container / 2,
          }}
        >
          <Avatar name={avatar.name} image={avatar.image} size={size} />
        </View>
      ))}
      {overflow > 0 ? (
        <View
          style={{
            marginLeft: -overlap,
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderRadius: sizeConfig.container / 2,
            backgroundColor: "rgba(255,255,255,0.15)",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: "#0a0a0a",
          }}
        >
          <Text
            style={{
              fontSize: sizeConfig.text - 2,
              fontWeight: "500",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            +{overflow}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
