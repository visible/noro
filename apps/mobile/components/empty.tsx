import { View, Text, type ViewStyle } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { Button } from "./button";

interface EmptyProps {
  icon?: "search" | "folder" | "key" | "lock" | "bell" | "shield";
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export function Empty({
  icon = "folder",
  title,
  description,
  action,
  style,
}: EmptyProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[
        {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
        },
        style,
      ]}
    >
      <Animated.View
        entering={FadeInUp.delay(100).duration(400)}
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          backgroundColor: "rgba(255,255,255,0.05)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <EmptyIcon name={icon} />
      </Animated.View>
      <Animated.Text
        entering={FadeInUp.delay(200).duration(400)}
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: "#ffffff",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {title}
      </Animated.Text>
      {description ? (
        <Animated.Text
          entering={FadeInUp.delay(300).duration(400)}
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            lineHeight: 20,
            maxWidth: 280,
          }}
        >
          {description}
        </Animated.Text>
      ) : null}
      {action ? (
        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={{ marginTop: 24 }}>
          <Button variant="primary" size="md" onPress={action.onPress}>
            {action.label}
          </Button>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

interface EmptyIconProps {
  name: "search" | "folder" | "key" | "lock" | "bell" | "shield";
}

function EmptyIcon({ name }: EmptyIconProps) {
  const color = "rgba(255,255,255,0.3)";
  const size = 36;

  const icons: Record<EmptyIconProps["name"], JSX.Element> = {
    search: (
      <View style={{ width: size, height: size }}>
        <View
          style={{
            position: "absolute",
            width: size * 0.6,
            height: size * 0.6,
            borderWidth: 2.5,
            borderColor: color,
            borderRadius: size * 0.3,
            top: 0,
            left: 0,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size * 0.35,
            height: 2.5,
            backgroundColor: color,
            bottom: size * 0.1,
            right: 0,
            transform: [{ rotate: "45deg" }],
            borderRadius: 2,
          }}
        />
      </View>
    ),
    folder: (
      <View style={{ width: size, height: size }}>
        <View
          style={{
            position: "absolute",
            width: size,
            height: size * 0.7,
            borderWidth: 2.5,
            borderColor: color,
            borderRadius: 6,
            bottom: 0,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size * 0.4,
            height: size * 0.2,
            borderWidth: 2.5,
            borderColor: color,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            borderBottomWidth: 0,
            top: size * 0.1,
            left: 0,
          }}
        />
      </View>
    ),
    key: (
      <View style={{ width: size, height: size }}>
        <View
          style={{
            position: "absolute",
            width: size * 0.4,
            height: size * 0.4,
            borderWidth: 2.5,
            borderColor: color,
            borderRadius: size * 0.2,
            top: 0,
            left: 0,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: 2.5,
            height: size * 0.55,
            backgroundColor: color,
            top: size * 0.35,
            left: size * 0.18,
            borderRadius: 2,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size * 0.2,
            height: 2.5,
            backgroundColor: color,
            bottom: size * 0.12,
            left: size * 0.18,
            borderRadius: 2,
          }}
        />
      </View>
    ),
    lock: (
      <View style={{ width: size, height: size }}>
        <View
          style={{
            position: "absolute",
            width: size * 0.8,
            height: size * 0.55,
            borderWidth: 2.5,
            borderColor: color,
            borderRadius: 6,
            bottom: 0,
            left: size * 0.1,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size * 0.5,
            height: size * 0.4,
            borderWidth: 2.5,
            borderColor: color,
            borderTopLeftRadius: size * 0.25,
            borderTopRightRadius: size * 0.25,
            borderBottomWidth: 0,
            top: 0,
            left: size * 0.25,
          }}
        />
      </View>
    ),
    bell: (
      <View style={{ width: size, height: size }}>
        <View
          style={{
            position: "absolute",
            width: size * 0.7,
            height: size * 0.65,
            borderWidth: 2.5,
            borderColor: color,
            borderTopLeftRadius: size * 0.35,
            borderTopRightRadius: size * 0.35,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            top: size * 0.1,
            left: size * 0.15,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size * 0.9,
            height: 2.5,
            backgroundColor: color,
            bottom: size * 0.2,
            left: size * 0.05,
            borderRadius: 2,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size * 0.25,
            height: 2.5,
            backgroundColor: color,
            bottom: size * 0.08,
            left: size * 0.375,
            borderRadius: 2,
          }}
        />
      </View>
    ),
    shield: (
      <View style={{ width: size, height: size }}>
        <View
          style={{
            position: "absolute",
            width: size * 0.8,
            height: size * 0.9,
            borderWidth: 2.5,
            borderColor: color,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            borderBottomLeftRadius: size * 0.4,
            borderBottomRightRadius: size * 0.4,
            top: 0,
            left: size * 0.1,
          }}
        />
      </View>
    ),
  };

  return icons[name];
}
