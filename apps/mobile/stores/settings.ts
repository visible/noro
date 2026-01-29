import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Theme = "light" | "dark" | "system";

export type AutolockDuration =
	| "immediate"
	| "1min"
	| "5min"
	| "15min"
	| "30min"
	| "1hour"
	| "never";

type SettingsState = {
	biometricEnabled: boolean;
	theme: Theme;
	autofillEnabled: boolean;
	autolockDuration: AutolockDuration;
	notificationsEnabled: boolean;
	clipboardTimeout: number;
	showPasswordStrength: boolean;
	defaultFolder: string | null;
	setBiometricEnabled: (enabled: boolean) => void;
	setTheme: (theme: Theme) => void;
	setAutofillEnabled: (enabled: boolean) => void;
	setAutolockDuration: (duration: AutolockDuration) => void;
	setNotificationsEnabled: (enabled: boolean) => void;
	setClipboardTimeout: (seconds: number) => void;
	setShowPasswordStrength: (show: boolean) => void;
	setDefaultFolder: (folderId: string | null) => void;
	reset: () => void;
};

const defaults = {
	biometricEnabled: false,
	theme: "system" as Theme,
	autofillEnabled: true,
	autolockDuration: "5min" as AutolockDuration,
	notificationsEnabled: true,
	clipboardTimeout: 30,
	showPasswordStrength: true,
	defaultFolder: null,
};

export const usesettings = create<SettingsState>()(
	persist(
		(set) => ({
			...defaults,
			setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
			setTheme: (theme) => set({ theme }),
			setAutofillEnabled: (enabled) => set({ autofillEnabled: enabled }),
			setAutolockDuration: (duration) => set({ autolockDuration: duration }),
			setNotificationsEnabled: (enabled) =>
				set({ notificationsEnabled: enabled }),
			setClipboardTimeout: (seconds) => set({ clipboardTimeout: seconds }),
			setShowPasswordStrength: (show) => set({ showPasswordStrength: show }),
			setDefaultFolder: (folderId) => set({ defaultFolder: folderId }),
			reset: () => set(defaults),
		}),
		{
			name: "settings",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
