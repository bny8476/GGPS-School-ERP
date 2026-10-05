import { getApiBaseUrl } from "./utils";

/**
 * Normalizes and resolves an image URL from any source:
 * - Public assets (/image.png)
 * - Remote Cloudinary, S3, Unsplash URLs
 * - Backend file upload paths (/uploads/..., uploads/..., /api/v1/files/...)
 * - Data URLs (data:image/...) and Blob URLs (blob:...)
 * - Legacy or hardcoded localhost URLs in production
 */
export function resolveImageUrl(src?: string | null): string | null {
  if (!src) return null;
  const trimmed = src.trim();
  if (!trimmed) return null;

  // Data URLs and Object URLs pass straight through
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const apiBase = getApiBaseUrl();

  // If URL has hardcoded localhost or 127.0.0.1 in non-localhost runtime, rewrite origin to current API base
  if (
    trimmed.startsWith("http://localhost:5001") ||
    trimmed.startsWith("http://localhost:5000") ||
    trimmed.startsWith("http://127.0.0.1:5001") ||
    trimmed.startsWith("http://127.0.0.1:5000")
  ) {
    if (typeof window !== "undefined") {
      const isLocalBrowser =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      if (!isLocalBrowser) {
        // Strip the localhost:500x origin and append path to current API base
        const parsed = new URL(trimmed);
        return `${apiBase}${parsed.pathname}${parsed.search}`;
      }
    }
    return trimmed;
  }

  // Already a full remote URL (https://... or http://...)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Backend uploads folder path
  if (trimmed.startsWith("/uploads/")) {
    return `${apiBase}${trimmed}`;
  }
  if (trimmed.startsWith("uploads/")) {
    return `${apiBase}/${trimmed}`;
  }

  // Backend API route path (e.g. /api/v1/files/:id/download)
  if (trimmed.startsWith("/api/")) {
    // In browser, rewrites handle /api/ locally, but in SSR or when pointing cross-origin:
    if (typeof window !== "undefined") {
      const isLocalBrowser =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      if (!isLocalBrowser && apiBase && !apiBase.includes(window.location.hostname)) {
        return `${apiBase}${trimmed}`;
      }
    }
    return trimmed;
  }

  // Normal root-relative public asset (e.g. /school-campus.jpg)
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Relative path without leading slash
  return `/${trimmed}`;
}

/**
 * Extracts 1-2 character uppercase initials from a person or entity name.
 */
export function getInitials(name?: string | null, fallback = "GG"): string {
  if (!name || typeof name !== "string") return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
