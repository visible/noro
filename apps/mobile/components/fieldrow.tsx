import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from "react-native-reanimated";
import { CopyIcon, EyeIcon, EyeSlashIcon, CheckIcon } from "./icons";

interface FieldRowProps {
  label: string;
  value: string;
  sensitive?: boolean;
  isTotp?: boolean;
  totpSecret?: string;
}

const base32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function decodeBase32(input: string): Uint8Array {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const bits: number[] = [];
  for (const char of clean) {
    const val = base32.indexOf(char);
    for (let i = 4; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bits[i + j];
    }
    bytes.push(byte);
  }
  return new Uint8Array(bytes);
}

async function hmacSha1(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
  return new Uint8Array(sig);
}

async function generateTotp(secret: string): Promise<string> {
  const key = decodeBase32(secret);
  let counter = Math.floor(Date.now() / 1000 / 30);
  const data = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    data[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }
  const hash = await hmacSha1(key, data);
  const offset = hash[19] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  return (binary % 1000000).toString().padStart(6, "0");
}

export function FieldRow({ label, value, sensitive, isTotp, totpSecret }: FieldRowProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [remaining, setRemaining] = useState(30);
  const scale = useSharedValue(1);

  const refresh = useCallback(async () => {
    if (!totpSecret) return;
    try {
      const code = await generateTotp(totpSecret);
      setTotpCode(code);
    } catch {
      setTotpCode("");
    }
  }, [totpSecret]);

  useEffect(() => {
    if (!isTotp || !totpSecret) return;
    refresh();
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const left = 30 - (now % 30);
      setRemaining(left);
      if (left === 30) refresh();
    }, 1000);
    return () => clearInterval(interval);
  }, [isTotp, totpSecret, refresh]);

  const displayValue = isTotp
    ? totpCode
    : sensitive && !revealed
      ? "\u2022".repeat(Math.min(value.length, 20))
      : value;

  async function handleCopy() {
    const textToCopy = isTotp ? totpCode : value;
    if (!textToCopy) return;
    await Clipboard.setStringAsync(textToCopy);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(withTiming(0.95, { duration: 50 }), withTiming(1, { duration: 100 }));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReveal() {
    setRevealed(!revealed);
    Haptics.selectionAsync();
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!value && !isTotp) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {isTotp && totpCode && (
          <View style={styles.countdown}>
            <View style={[styles.countdownBar, { width: `${(remaining / 30) * 100}%` }]} />
            <Text style={styles.countdownText}>{remaining}s</Text>
          </View>
        )}
      </View>
      <View style={styles.row}>
        <Animated.View style={[styles.valueContainer, animatedStyle]}>
          <Text style={[styles.value, isTotp && styles.totpValue]} numberOfLines={sensitive ? 1 : 3}>
            {displayValue || "-"}
          </Text>
        </Animated.View>
        <View style={styles.actions}>
          {sensitive && !isTotp && (
            <Pressable onPress={handleReveal} style={styles.button} hitSlop={8}>
              {revealed ? <EyeSlashIcon /> : <EyeIcon />}
            </Pressable>
          )}
          <Pressable onPress={handleCopy} style={styles.button} hitSlop={8}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    textTransform: "lowercase",
  },
  countdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countdownBar: {
    height: 3,
    backgroundColor: "#d4b08c",
    borderRadius: 2,
    minWidth: 40,
  },
  countdownText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    fontVariant: ["tabular-nums"],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  valueContainer: {
    flex: 1,
  },
  value: {
    fontSize: 15,
    color: "#fff",
    fontFamily: "monospace",
  },
  totpValue: {
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: 4,
    color: "#d4b08c",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  button: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
});
