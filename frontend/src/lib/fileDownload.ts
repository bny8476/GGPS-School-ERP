import toast from 'react-hot-toast';

export interface DownloadOptions {
  showToast?: boolean;
  onProgress?: (receivedBytes: number, totalBytes: number) => void;
}

/**
 * Universal production-ready file downloader
 * - Authenticated with stored JWT
 * - Reads Content-Disposition for server-authoritative filenames
 * - Creates temporary Blob URL and revokes it
 * - Handles 401, 403, 404, 500 cleanly with UI feedback
 */
export async function downloadFile(
  fileIdOrUrl: string,
  fallbackFilename?: string,
  options: DownloadOptions = { showToast: true }
): Promise<{ success: boolean; filename?: string; error?: string }> {
  let toastId: string | undefined;
  if (options.showToast) {
    toastId = toast.loading(`Preparing secure download...`);
  }

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    let targetUrl = fileIdOrUrl;

    if (!fileIdOrUrl.startsWith('http://') && !fileIdOrUrl.startsWith('https://')) {
      if (fileIdOrUrl.startsWith('/api')) {
        targetUrl = `${apiBase}${fileIdOrUrl}`;
      } else {
        targetUrl = `${apiBase}/api/v1/files/${fileIdOrUrl}/download`;
      }
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Download failed with HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.message) errorMessage = errJson.message;
      } catch {
        // Response was not JSON
      }

      if (response.status === 401) {
        errorMessage = 'Authentication expired. Please log in again to download documents.';
      } else if (response.status === 403) {
        errorMessage = 'Access denied: You do not possess clearance for this file.';
      } else if (response.status === 404) {
        errorMessage = 'File not found on server storage.';
      }

      if (options.showToast && toastId) {
        toast.error(errorMessage, { id: toastId });
      }
      return { success: false, error: errorMessage };
    }

    // Extract filename from Content-Disposition header if present
    const disposition = response.headers.get('Content-Disposition') || '';
    let resolvedFilename = fallbackFilename || 'GGPS-Document.pdf';

    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      resolvedFilename = matches[1].replace(/['"]/g, '');
    }

    // Also support RFC 5987 UTF-8 encoded filename (filename*=UTF-8''...)
    const utf8Matches = /filename\*=UTF-8''([^;\n]*)/.exec(disposition);
    if (utf8Matches != null && utf8Matches[1]) {
      try {
        resolvedFilename = decodeURIComponent(utf8Matches[1]);
      } catch {
        // Fallback to previous
      }
    }

    // Read binary blob
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // Trigger browser download via invisible link
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = resolvedFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Cleanup link and revoke temporary blob URL
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 200);

    if (options.showToast && toastId) {
      toast.success(`Downloaded: ${resolvedFilename}`, { id: toastId });
    }

    return { success: true, filename: resolvedFilename };
  } catch (error: any) {
    console.error('Download execution failed:', error);
    const msg = error.message || 'Network error encountered during document download.';
    if (options.showToast && toastId) {
      toast.error(msg, { id: toastId });
    }
    return { success: false, error: msg };
  }
}

/**
 * Sanitize filename by stripping illegal path characters
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim();
}

/**
 * Centralized PDF file downloader
 */
export async function downloadPdf(
  fileIdOrUrl: string,
  fallbackFilename: string = 'GGPS_Document.pdf',
  options?: DownloadOptions
) {
  const safeName = sanitizeFilename(fallbackFilename.endsWith('.pdf') ? fallbackFilename : `${fallbackFilename}.pdf`);
  return downloadFile(fileIdOrUrl, safeName, options);
}

/**
 * Centralized CSV file downloader
 */
export async function downloadCsv(
  fileIdOrUrl: string,
  fallbackFilename: string = 'GGPS_Export.csv',
  options?: DownloadOptions
) {
  const safeName = sanitizeFilename(fallbackFilename.endsWith('.csv') ? fallbackFilename : `${fallbackFilename}.csv`);
  return downloadFile(fileIdOrUrl, safeName, options);
}

/**
 * Centralized Excel file downloader
 */
export async function downloadExcel(
  fileIdOrUrl: string,
  fallbackFilename: string = 'GGPS_Export.xlsx',
  options?: DownloadOptions
) {
  const safeName = sanitizeFilename(fallbackFilename.endsWith('.xlsx') ? fallbackFilename : `${fallbackFilename}.xlsx`);
  return downloadFile(fileIdOrUrl, safeName, options);
}

/**
 * Centralized Image file downloader
 */
export async function downloadImage(
  fileIdOrUrl: string,
  fallbackFilename: string = 'GGPS_Asset.png',
  options?: DownloadOptions
) {
  return downloadFile(fileIdOrUrl, sanitizeFilename(fallbackFilename), options);
}

