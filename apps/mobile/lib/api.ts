import { z } from "zod";
import { gettoken } from "./storage";

const API_HOST = process.env.EXPO_PUBLIC_API_URL || "https://noro.sh";
const BASE_URL = `${API_HOST}/api`;
const AUTH_URL = `${API_HOST}/api/auth`;
const V1_URL = `${API_HOST}/api/v1`;

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

async function request<T>(
  path: string,
  options: {
    method?: Method;
    body?: unknown;
    schema?: z.ZodType<T>;
    auth?: boolean;
    baseurl?: string;
  } = {}
): Promise<T> {
  const { method = "GET", body, schema, auth = true, baseurl = V1_URL } = options;

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (auth) {
    const token = await gettoken();
    if (token) {
      headers["authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${baseurl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error || "unknown",
      data.message || data.error || "request failed"
    );
  }

  if (schema) {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new ApiError(500, "validation", "invalid response format");
    }
    return result.data;
  }

  return data as T;
}

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
});

export const VaultSchema = z.object({
  data: z.string(),
  revision: z.number(),
});

export const FolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullable(),
  color: z.string(),
  icon: z.string(),
  order: z.number(),
});

export const FoldersResponseSchema = z.object({
  folders: z.array(FolderSchema),
  counts: z.record(z.number()),
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

export type User = z.infer<typeof UserSchema>;
export type Vault = z.infer<typeof VaultSchema>;
export type Folder = z.infer<typeof FolderSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>("/sign-in/email", {
        method: "POST",
        body: { email, password },
        schema: AuthResponseSchema,
        auth: false,
        baseurl: AUTH_URL,
      }),

    register: (email: string, password: string, name?: string) =>
      request<AuthResponse>("/sign-up/email", {
        method: "POST",
        body: { email, password, name },
        schema: AuthResponseSchema,
        auth: false,
        baseurl: AUTH_URL,
      }),

    logout: () =>
      request<{ success: boolean }>("/sign-out", {
        method: "POST",
        baseurl: AUTH_URL,
      }),

    session: () =>
      request<{ session: { user: User } }>("/get-session", { baseurl: AUTH_URL }),
  },

  user: {
    get: () =>
      request<{ user: User }>("/user", {
        schema: z.object({ user: UserSchema }),
      }),
  },

  vault: {
    get: () =>
      request<Vault>("/vault", {
        schema: VaultSchema,
      }),

    update: (data: string, revision: number) =>
      request<{ success: boolean; revision: number }>("/vault", {
        method: "PUT",
        body: { data, revision },
      }),
  },

  folders: {
    list: () =>
      request<z.infer<typeof FoldersResponseSchema>>("/folders", {
        schema: FoldersResponseSchema,
      }),

    create: (name: string, parentId?: string) =>
      request<{ folder: Folder }>("/folders", {
        method: "POST",
        body: { name, parentId },
      }),

    update: (id: string, data: { name?: string; parentId?: string; icon?: string }) =>
      request<{ folder: Folder }>(`/folders/${id}`, {
        method: "PATCH",
        body: data,
      }),

    delete: (id: string) =>
      request<{ success: boolean }>(`/folders/${id}`, {
        method: "DELETE",
      }),
  },

  health: {
    check: () =>
      request<{ status: string }>("/health", { auth: false, baseurl: BASE_URL }),
  },
};
