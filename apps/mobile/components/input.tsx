import { forwardRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  Pressable,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, secureTextEntry, containerStyle, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const borderOpacity = useSharedValue(0.1);

    const borderStyle = useAnimatedStyle(() => ({
      borderColor: error
        ? "rgba(239,68,68,1)"
        : `rgba(212,176,140,${borderOpacity.value})`,
    }));

    function handleFocus(e: any) {
      setFocused(true);
      borderOpacity.value = withTiming(0.8, { duration: 150 });
      onFocus?.(e);
    }

    function handleBlur(e: any) {
      setFocused(false);
      borderOpacity.value = withTiming(0.1, { duration: 150 });
      onBlur?.(e);
    }

    function togglePassword() {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowPassword((prev) => !prev);
    }

    const isPassword = secureTextEntry !== undefined;

    return (
      <View style={containerStyle}>
        {label ? (
          <Text
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: "rgba(255,255,255,0.7)",
              marginBottom: 8,
            }}
          >
            {label}
          </Text>
        ) : null}
        <AnimatedView
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 14,
            },
            borderStyle,
          ]}
        >
          <TextInput
            ref={ref}
            placeholderTextColor="rgba(255,255,255,0.3)"
            secureTextEntry={isPassword && !showPassword}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              flex: 1,
              height: 48,
              fontSize: 15,
              color: "#ffffff",
            }}
            {...props}
          />
          {isPassword ? (
            <Pressable onPress={togglePassword} hitSlop={8}>
              {showPassword ? (
                <EyeOffIcon />
              ) : (
                <EyeIcon />
              )}
            </Pressable>
          ) : null}
        </AnimatedView>
        {error ? (
          <Text
            style={{
              fontSize: 12,
              color: "#ef4444",
              marginTop: 6,
            }}
          >
            {error}
          </Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = "Input";

function EyeIcon() {
  return (
    <View style={{ width: 20, height: 20 }}>
      <View
        style={{
          position: "absolute",
          width: 14,
          height: 10,
          borderWidth: 1.5,
          borderColor: "rgba(255,255,255,0.4)",
          borderRadius: 7,
          top: 5,
          left: 3,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 4,
          height: 4,
          backgroundColor: "rgba(255,255,255,0.4)",
          borderRadius: 2,
          top: 8,
          left: 8,
        }}
      />
    </View>
  );
}

function EyeOffIcon() {
  return (
    <View style={{ width: 20, height: 20 }}>
      <View
        style={{
          position: "absolute",
          width: 14,
          height: 10,
          borderWidth: 1.5,
          borderColor: "rgba(255,255,255,0.4)",
          borderRadius: 7,
          top: 5,
          left: 3,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 4,
          height: 4,
          backgroundColor: "rgba(255,255,255,0.4)",
          borderRadius: 2,
          top: 8,
          left: 8,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 20,
          height: 1.5,
          backgroundColor: "rgba(255,255,255,0.4)",
          top: 9,
          left: 0,
          transform: [{ rotate: "-45deg" }],
        }}
      />
    </View>
  );
}
