import { create } from "zustand";
import { api, type User, ApiError } from "./api";
import { gettoken, settoken, cleartoken, clearall } from "./storage";

type AuthState = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
};

type AuthActions = {
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

type AuthStore = AuthState & AuthActions;

export const useauth = create<AuthStore>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    set({ loading: true });

    try {
      const token = await gettoken();
      if (!token) {
        set({ user: null, loading: false, initialized: true });
        return;
      }

      const { user } = await api.user.get();
      set({ user, loading: false, initialized: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await cleartoken();
      }
      set({ user: null, loading: false, initialized: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true });

    try {
      const { token, user } = await api.auth.login(email, password);
      await settoken(token);
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, name?: string) => {
    set({ loading: true });

    try {
      const { token, user } = await api.auth.register(email, password, name);
      await settoken(token);
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });

    try {
      await api.auth.logout();
    } catch {
    } finally {
      await clearall();
      set({ user: null, loading: false });
    }
  },

  refresh: async () => {
    try {
      const { user } = await api.user.get();
      set({ user });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearall();
        set({ user: null });
      }
    }
  },
}));

export function isauthenticated(): boolean {
  return useauth.getState().user !== null;
}

export async function requireauth(): Promise<User> {
  const { user, init, initialized } = useauth.getState();

  if (!initialized) {
    await init();
  }

  const current = useauth.getState().user;
  if (!current) {
    throw new ApiError(401, "unauthorized", "authentication required");
  }

  return current;
}
