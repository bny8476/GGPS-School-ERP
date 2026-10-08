import { create } from "zustand";
import { UserRole, normalizeRole, ROLE_PERMISSIONS } from "@/lib/rbac";

export interface AuthUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole | string;
  avatar?: string;
  phone?: string;
  [key: string]: unknown;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: UserRole;
  permissions: string[];
  isLoading: boolean;
  setAuth: (data: { user?: AuthUser; token?: string; role?: string; permissions?: string[]; [key: string]: unknown }) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  role: "RESTRICTED",
  permissions: [],
  isLoading: true,

  setAuth: (data) => {
    const rawRole = (data.role || (data.user && data.user.role) || "PARENT") as string;
    const role = normalizeRole(rawRole);
    
    const user: AuthUser = (data.user || {
      id: String(data._id || data.id || ""),
      name: String(data.name || "User"),
      email: String(data.email || ""),
      role,
      avatar: (data.avatar as string) || undefined,
    }) as AuthUser;

    const permissions = Array.isArray(data.permissions) && data.permissions.length > 0
      ? data.permissions
      : ROLE_PERMISSIONS[role] || [];

    if (typeof window !== "undefined") {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken as string);
      }
      localStorage.setItem("user_profile", JSON.stringify({
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      }));
      localStorage.setItem("user", JSON.stringify({
        ...user,
        role: user.role,
      }));
    }

    set({
      user,
      isAuthenticated: true,
      role,
      permissions,
      isLoading: false,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_profile");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("ggps_cached_stats");
      // Explicitly expire cookies so Next.js middleware doesn't bounce /login back to /dashboard
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0";
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0";
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0";
    }
    set({
      user: null,
      isAuthenticated: false,
      role: "RESTRICTED",
      permissions: [],
      isLoading: false,
    });
    if (typeof window !== "undefined") {
      window.location.href = "/login?logout=true";
    }
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user_profile") || localStorage.getItem("user");

      if (token && userStr) {
        const data = JSON.parse(userStr);
        const rawRole = (data.role || (data.user && data.user.role)) as string;
        const role = normalizeRole(rawRole);
        const user: AuthUser = (data.user || data) as AuthUser;
        const permissions = ROLE_PERMISSIONS[role] || [];

        // 1. Optimistic hydration for instant 0ms UI load
        set({
          user,
          isAuthenticated: true,
          role,
          permissions,
          isLoading: false,
        });
        return;
      }
    } catch (e) {
      console.error("Auth hydration error:", e);
    } finally {
      set({ isLoading: false });
    }
  },
}));
