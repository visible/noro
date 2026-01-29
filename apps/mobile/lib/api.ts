import { z } from "zod";
import { gettoken } from "./storage";

const BASE_URL = "https://noro.sh/api/v1";

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
  } = {}
): Promise<T> {
  const { method = "GET", body, schema, auth = true } = options;

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (auth) {
    const token = await gettoken();
    if (token) {
      headers["authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
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
      request<AuthResponse>("/auth/sign-in/email", {
        method: "POST",
        body: { email, password },
        schema: AuthResponseSchema,
        auth: false,
      }),

    register: (email: string, password: string, name?: string) =>
      request<AuthResponse>("/auth/sign-up/email", {
        method: "POST",
        body: { email, password, name },
        schema: AuthResponseSchema,
        auth: false,
      }),

    logout: () =>
      request<{ success: boolean }>("/auth/sign-out", {
        method: "POST",
      }),

    session: () =>
      request<{ session: { user: User } }>("/auth/get-session"),
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
      request<{ status: string }>("/health", { auth: false }),
  },
};
