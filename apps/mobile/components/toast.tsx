import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  SlideInUp,
  SlideOutUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

type Variant = "success" | "error" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: Variant;
}

interface ToastContextValue {
  toast: (options: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const { width } = Dimensions.get("window");

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const progress = useSharedValue(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Haptics.notificationAsync(
      toast.variant === "success"
        ? Haptics.NotificationFeedbackType.Success
        : toast.variant === "error"
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Warning
    );

    progress.value = withTiming(0, { duration: 5000 });
    timerRef.current = setTimeout(onDismiss, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const variantColors: Record<Variant, { icon: string; progress: string }> = {
    success: { icon: "#4ade80", progress: "#22c55e" },
    error: { icon: "#f87171", progress: "#ef4444" },
    info: { icon: "#60a5fa", progress: "#3b82f6" },
  };

  const colors = variantColors[toast.variant];

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(18).stiffness(200)}
      exiting={SlideOutUp.springify().damping(18).stiffness(200)}
      style={{
        width: width - 32,
        backgroundColor: "rgba(24,24,24,0.98)",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          padding: 14,
          gap: 12,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: `${colors.icon}15`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {toast.variant === "success" ? (
            <CheckIcon color={colors.icon} />
          ) : toast.variant === "error" ? (
            <CloseIcon color={colors.icon} />
          ) : (
            <InfoIcon color={colors.icon} />
          )}
        </View>
        <View style={{ flex: 1, paddingTop: 2 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#ffffff",
            }}
          >
            {toast.title}
          </Text>
          {toast.description ? (
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                marginTop: 2,
                lineHeight: 18,
              }}
            >
              {toast.description}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={onDismiss}
          hitSlop={8}
          style={{
            padding: 4,
            marginTop: -2,
            marginRight: -2,
          }}
        >
          <CloseIcon color="rgba(255,255,255,0.4)" size={16} />
        </Pressable>
      </View>
      <Animated.View
        style={[
          {
            height: 2,
            backgroundColor: colors.progress,
          },
          progressStyle,
        ]}
      />
    </Animated.View>
  );
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();

  const toast = useCallback((options: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <View
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          right: 16,
          zIndex: 9999,
          gap: 8,
        }}
        pointerEvents="box-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function CheckIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: "absolute",
          width: size * 0.5,
          height: 2,
          backgroundColor: color,
          top: size * 0.55,
          left: size * 0.1,
          transform: [{ rotate: "45deg" }],
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.7,
          height: 2,
          backgroundColor: color,
          top: size * 0.45,
          left: size * 0.3,
          transform: [{ rotate: "-45deg" }],
          borderRadius: 1,
        }}
      />
    </View>
  );
}

function CloseIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: "absolute",
          width: size * 0.7,
          height: 2,
          backgroundColor: color,
          top: size * 0.45,
          left: size * 0.15,
          transform: [{ rotate: "45deg" }],
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.7,
          height: 2,
          backgroundColor: color,
          top: size * 0.45,
          left: size * 0.15,
          transform: [{ rotate: "-45deg" }],
          borderRadius: 1,
        }}
      />
    </View>
  );
}

function InfoIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderWidth: 1.5,
          borderColor: color,
          borderRadius: size / 2,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 2,
          height: size * 0.25,
          backgroundColor: color,
          top: size * 0.22,
          left: size * 0.44,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 2,
          height: size * 0.3,
          backgroundColor: color,
          top: size * 0.48,
          left: size * 0.44,
          borderRadius: 1,
        }}
      />
    </View>
  );
}
