import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Svg, Path, Circle, Rect } from "react-native-svg";

const colors = {
  bg: "#0a0a0a",
  accent: "#d4b08c",
  surface: "#141414",
  surfaceHover: "#1a1a1a",
  border: "#1f1f1f",
  text: "#ffffff",
  muted: "#666666",
  subtle: "#999999",
  danger: "#ef4444",
  success: "#22c55e",
};

function UserIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={colors.text} strokeWidth={1.5} />
      <Path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={colors.text} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function ShieldIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3l8 4v5c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V7l8-4z"
        stroke={colors.text}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FingerprintIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12a10 10 0 0120 0M7 12a5 5 0 0110 0M12 12v4"
        stroke={colors.text}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={colors.text} strokeWidth={1.5} />
      <Path d="M12 7v5l3 3" stroke={colors.text} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function CloudIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"
        stroke={colors.text}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TrashIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={colors.text} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={colors.text} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function InfoIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={colors.text} strokeWidth={1.5} />
      <Path d="M12 16v-4M12 8h.01" stroke={colors.text} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function HelpIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={colors.text} strokeWidth={1.5} />
      <Path
        d="M9 9a3 3 0 115.12 2.12c-.96.73-2.12 1.38-2.12 2.88M12 17h.01"
        stroke={colors.text}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function LogoutIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={colors.danger} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M16 17l5-5-5-5M21 12H9" stroke={colors.danger} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={colors.muted} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SyncIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12a8 8 0 018-8c2.6 0 4.9 1.2 6.4 3.1M20 12a8 8 0 01-8 8c-2.6 0-4.9-1.2-6.4-3.1"
        stroke={colors.success}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(!value);
      }}
      style={[styles.toggle, value && styles.toggleActive]}
    >
      <Animated.View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
    </Pressable>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
  toggle,
  toggleValue,
  onToggle,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        style={styles.settingsRow}
        disabled={!onPress && !toggle}
      >
        <View style={styles.rowIcon}>{icon}</View>
        <View style={styles.rowContent}>
          <Text style={[styles.rowTitle, danger && styles.rowTitleDanger]}>{title}</Text>
          {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
        {toggle && onToggle ? (
          <Toggle value={toggleValue || false} onChange={onToggle} />
        ) : value ? (
          <View style={styles.rowValueContainer}>
            <Text style={styles.rowValue}>{value}</Text>
            {onPress && <ChevronIcon />}
          </View>
        ) : onPress ? (
          <ChevronIcon />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [autoLockTime, setAutoLockTime] = useState("15 minutes");

  const handleLogout = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out? Your vault will be locked.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {},
        },
      ]
    );
  }, []);

  const handleClearCache = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Clear Cache",
      "This will clear all cached data. Your vault items will be re-synced.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <UserIcon />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Josh</Text>
            <Text style={styles.profileEmail}>josh@noro.sh</Text>
          </View>
          <View style={styles.syncStatus}>
            <SyncIcon />
            <Text style={styles.syncText}>Synced</Text>
          </View>
        </View>

        <SettingsSection title="Security">
          <SettingsRow
            icon={<FingerprintIcon />}
            title="Biometric Unlock"
            subtitle="Use Face ID or fingerprint"
            toggle
            toggleValue={biometricEnabled}
            onToggle={setBiometricEnabled}
          />
          <SettingsRow
            icon={<ClockIcon />}
            title="Auto-Lock"
            subtitle="Lock vault after inactivity"
            value={autoLockTime}
            onPress={() => {}}
          />
          <SettingsRow
            icon={<ShieldIcon />}
            title="Change Password"
            subtitle="Update your master password"
            onPress={() => {}}
          />
        </SettingsSection>

        <SettingsSection title="Vault">
          <SettingsRow
            icon={<CloudIcon />}
            title="Sync"
            subtitle="Last synced 2 minutes ago"
            value="Auto"
            onPress={() => {}}
          />
          <SettingsRow
            icon={<TrashIcon />}
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={handleClearCache}
          />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow
            icon={<InfoIcon />}
            title="Version"
            value="1.0.0"
          />
          <SettingsRow
            icon={<HelpIcon />}
            title="Help & Support"
            onPress={() => {}}
          />
        </SettingsSection>

        <View style={styles.logoutSection}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          >
            <LogoutIcon />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <View style={styles.logoContainer}>
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                fill={colors.accent}
              />
              <Circle cx={12} cy={12} r={4} fill={colors.accent} />
            </Svg>
          </View>
          <Text style={styles.footerText}>noro</Text>
          <Text style={styles.footerSubtext}>Secure password manager</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  syncStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  syncText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.success,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: {
    flex: 1,
    marginLeft: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  rowTitleDanger: {
    color: colors.danger,
  },
  rowSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  rowValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
    color: colors.muted,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg,
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: colors.accent,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  logoutSection: {
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.danger,
  },
  footer: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  footerText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  footerSubtext: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
});
