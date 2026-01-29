import { useState } from "react";
import { View, TextInput, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { colors } from "./constants";

interface FieldInputProps {
  index: number;
  label: string;
  type: string;
  required?: boolean;
  half?: boolean;
  value: string;
  onChange: (value: string) => void;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
}

export function FieldInput({
  index,
  label,
  type,
  required,
  value,
  onChange,
  isPasswordVisible,
  onTogglePassword,
}: FieldInputProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = useAnimatedStyle(() => ({
    borderColor: withTiming(focused ? colors.accent + "60" : "rgba(255,255,255,0.08)", { duration: 150 }),
  }));

  const isPassword = type === "password";
  const isTextarea = type === "textarea";

  return (
    <Animated.View
      entering={FadeInDown.delay(150 + index * 30).duration(200)}
      style={styles.container}
    >
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}>*</Text>}
      </View>
      <Animated.View style={[styles.inputContainer, isTextarea && styles.textareaContainer, borderColor]}>
        <TextInput
          style={[styles.input, isTextarea && styles.textareaInput]}
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          multiline={isTextarea}
          textAlignVertical={isTextarea ? "top" : "center"}
          placeholderTextColor={colors.muted}
        />
        {isPassword && (
          <Pressable style={styles.toggleButton} onPress={onTogglePassword} hitSlop={8}>
            {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
          </Pressable>
        )}
      </Animated.View>
    </Animated.View>
  );
}

function EyeIcon() {
  return (
    <View style={styles.eyeIcon}>
      <View style={styles.eyeOuter} />
      <View style={styles.eyeInner} />
    </View>
  );
}

function EyeSlashIcon() {
  return (
    <View style={styles.eyeIcon}>
      <View style={styles.eyeOuter} />
      <View style={styles.eyeInner} />
      <View style={styles.eyeSlash} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  required: {
    fontSize: 13,
    color: colors.accent,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    minHeight: 52,
  },
  textareaContainer: {
    minHeight: 100,
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  textareaInput: {
    height: 76,
  },
  toggleButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  eyeIcon: {
    width: 20,
    height: 20,
    position: "relative",
  },
  eyeOuter: {
    position: "absolute",
    width: 14,
    height: 10,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 7,
    top: 5,
    left: 3,
  },
  eyeInner: {
    position: "absolute",
    width: 4,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 2,
    top: 8,
    left: 8,
  },
  eyeSlash: {
    position: "absolute",
    width: 20,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.4)",
    top: 9,
    left: 0,
    transform: [{ rotate: "-45deg" }],
  },
});
