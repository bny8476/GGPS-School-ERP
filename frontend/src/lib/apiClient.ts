import { getApiBaseUrl } from "./utils";

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public status: number;
  public data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
}

let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const localRefreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
      const body = localRefreshToken ? JSON.stringify({ refreshToken: localRefreshToken }) : JSON.stringify({});

      // Try /api/v1/auth/refresh first, then fallback to /api/auth/refresh
      let res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) {
        res = await fetch(`${baseUrl}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body,
        });
      }

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && typeof window !== "undefined") {
          const newToken = data.token || data.accessToken || data.data?.token || data.data?.accessToken;
          const newRefreshToken = data.refreshToken || data.data?.refreshToken;
          if (newToken) localStorage.setItem("token", newToken);
          if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

class ApiClient {
  private getHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers(customHeaders);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
    const baseUrl = getApiBaseUrl();
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${baseUrl}${cleanPath}`);

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          url.searchParams.append(key, String(val));
        }
      });
    }

    return url.toString();
  }

  public async request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, body, headers: customHeaders, ...restOptions } = options;
    const url = this.buildUrl(path, params);
    const headers = this.getHeaders(customHeaders);

    const init: RequestInit = {
      ...restOptions,
      headers,
      credentials: "include",
    };

    if (body !== undefined) {
      init.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error occurred";
      throw new ApiError(msg, 0);
    }

    // Attempt silent token refresh on 401 before giving up
    if (response.status === 401 && !path.includes("/auth/login") && !path.includes("/auth/refresh")) {
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        try {
          // Retry original request once with fresh token and cookie
          const retryHeaders = this.getHeaders(customHeaders);
          response = await fetch(url, { ...init, headers: retryHeaders });
        } catch {
          // Fall through to error handler
        }
      }
    }

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_profile");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
      throw new ApiError("Session expired or unauthorized", 401);
    }

    const contentType = response.headers.get("content-type") || "";
    let data: unknown;

    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      if (data && typeof data === "object" && "message" in data) {
        errorMessage = String((data as { message: unknown }).message);
      }
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  }

  public get<T = unknown>(path: string, options?: Omit<RequestOptions, "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  public post<T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  public put<T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  public patch<T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  public delete<T = unknown>(path: string, options?: Omit<RequestOptions, "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
export default apiClient;

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const buildHeaders = () => {
    const headers = new Headers(init.headers);
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  };

  const run = () => {
    const headers = buildHeaders();
    return fetch(input, { ...init, headers, credentials: "include" });
  };

  let res = await run();
  if (res.status === 401 && !input.includes("/auth/login") && !input.includes("/auth/refresh")) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      res = await run();
    }
  }
  return res;
}
