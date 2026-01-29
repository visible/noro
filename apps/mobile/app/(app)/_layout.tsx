import { Tabs } from "expo-router";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Svg, Path, Rect, Circle, G, Line } from "react-native-svg";

const colors = {
  bg: "#0a0a0a",
  accent: "#d4b08c",
  surface: "#141414",
  border: "#1f1f1f",
  text: "#ffffff",
  muted: "#666666",
};

function VaultIcon({ focused }: { focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={5}
        width={18}
        height={14}
        rx={2}
        stroke={focused ? colors.accent : colors.muted}
        strokeWidth={1.5}
      />
      <Circle
        cx={12}
        cy={12}
        r={3}
        stroke={focused ? colors.accent : colors.muted}
        strokeWidth={1.5}
      />
      <Path
        d="M12 9v-2"
        stroke={focused ? colors.accent : colors.muted}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function SearchIcon({ focused }: { focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={11}
        cy={11}
        r={7}
        stroke={focused ? colors.accent : colors.muted}
        strokeWidth={1.5}
      />
      <Path
        d="M21 21l-4.35-4.35"
        stroke={focused ? colors.accent : colors.muted}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function GeneratorIcon({ focused }: { focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={3}
        width={7}
        height={7}
        rx={1.5}
        stroke={focused ? colors.accent : colors.muted}
        strokeWidth={1.5}
      />
      <Rect
        x={14}
        y={3}
        width={7}
        height={7}
        rx={1.5}
        stroke={focused ? colors.accent : colors.muted}
        strokeWidth={1.5}
      />
      <Rect
        x={3}
        y={14}
        width={7}
        height={7}
        rx={1.5}
        stroke={focused ? colors.accent : colors.muted}
        strokeWidth={1.5}
      />
      <G stroke={focused ? colors.accent : colors.muted} strokeWidth={1.5} strokeLinecap="round">
        <Line x1={17.5} y1={14} x2={17.5} y2={21} />
        <Line x1={14} y1={17.5} x2={21} y2={17.5} />
      </G>
    </Svg>
  );
}

function SettingsIcon({ focused }: { focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={12}
        cy={12}
        r={3}
        stroke={focused ? colors.accent : colors.muted}
        strokeWidth={1.5}
      />
      <Path
        d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
        stroke={focused ? colors.accent : colors.muted}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function TabBarIcon({
  children,
  focused,
}: {
  children: React.ReactNode;
  focused: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [0.9, 1], [0.7, 1]),
  }));

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      {children}
      {focused && <View style={styles.indicator} />}
    </Animated.View>
  );
}

function TabBarButton(props: any) {
  const { children, onPress } = props;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} style={styles.tabButton}>
      {children}
    </Pressable>
  );
}

export default function AppLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: [styles.tabBar, { height: 60 + Math.max(insets.bottom, 10) }],
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarButton: (props) => <TabBarButton {...props} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={focused}>
                <VaultIcon focused={focused} />
              </TabBarIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={focused}>
                <SearchIcon focused={focused} />
              </TabBarIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="generator"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={focused}>
                <GeneratorIcon focused={focused} />
              </TabBarIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={focused}>
                <SettingsIcon focused={focused} />
              </TabBarIcon>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 6,
  },
});
