import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

export type User = {
	id: string;
	email: string;
	name: string | null;
};

type AuthState = {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	login: (user: User, token: string) => void;
	logout: () => void;
	setUser: (user: User) => void;
};

const securestorage = {
	getItem: async (name: string) => {
		return SecureStore.getItemAsync(name);
	},
	setItem: async (name: string, value: string) => {
		await SecureStore.setItemAsync(name, value);
	},
	removeItem: async (name: string) => {
		await SecureStore.deleteItemAsync(name);
	},
};

export const useauth = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			login: (user, token) =>
				set({
					user,
					token,
					isAuthenticated: true,
				}),
			logout: () =>
				set({
					user: null,
					token: null,
					isAuthenticated: false,
				}),
			setUser: (user) => set({ user }),
		}),
		{
			name: "auth",
			storage: createJSONStorage(() => securestorage),
		}
	)
);
