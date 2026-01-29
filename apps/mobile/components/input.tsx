import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  type?: "text" | "email" | "password";
}

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
        />
        <Path
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
        />
      </Svg>
    );
  }
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </Svg>
  );
}

export function Input({ label, error, type = "text", style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const borderColor = useSharedValue("rgba(255,255,255,0.1)");

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  function handleFocus() {
    setFocused(true);
    borderColor.value = withTiming(error ? "#ef4444" : "#FF6B00", { duration: 150 });
  }

  function handleBlur() {
    setFocused(false);
    borderColor.value = withTiming(error ? "#ef4444" : "rgba(255,255,255,0.1)", { duration: 150 });
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputContainer,
          animatedBorder,
          error && styles.inputError,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="rgba(255,255,255,0.3)"
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={type === "password" && !showPassword}
          keyboardType={type === "email" ? "email-address" : "default"}
          autoCapitalize={type === "email" ? "none" : "sentences"}
          autoCorrect={type !== "email" && type !== "password"}
          {...props}
        />
        {type === "password" && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.toggle}
            hitSlop={8}
          >
            <EyeIcon visible={showPassword} />
          </Pressable>
        )}
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#ffffff",
    height: "100%",
  },
  toggle: {
    padding: 4,
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 6,
  },
});
