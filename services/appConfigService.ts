/**
 * Dynamic Application Configuration Service
 * Fetches runtime configuration securely from the Cloudflare Admin Backend Worker.
 * Ensures zero secrets or environment variables are stored in the client codebase.
 */
import { DEFAULT_CLOUDFLARE_ADMIN_BACKEND_URL } from './backendConfig';

export interface AppRuntimeConfig {
  appName: string;
  backendUrl: string;
  database: string;
  databaseConfigured: boolean;
  bandwidthSaver: boolean;
  version: string;
  googleMapsPlatformKey?: string;
  vapidPublicKey?: string;
  features: {
    maps: boolean;
    aiAssistant: boolean;
    pushNotifications: boolean;
    disasterRecoveryBackup: boolean;
    leadDeltaSync: boolean;
  };
}

const DEFAULT_CONFIG: AppRuntimeConfig = {
  appName: 'A Big Engine - Automobile Repair & Maintenance Management',
  backendUrl: DEFAULT_CLOUDFLARE_ADMIN_BACKEND_URL,
  database: 'Cloudflare Admin Edge (Neon PostgreSQL)',
  databaseConfigured: true,
  bandwidthSaver: true,
  version: '2.5.0',
  googleMapsPlatformKey: '',
  features: {
    maps: true,
    aiAssistant: true,
    pushNotifications: true,
    disasterRecoveryBackup: false,
    leadDeltaSync: false,
  },
};

let cachedConfig: AppRuntimeConfig = (() => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('app_runtime_config');
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {}
  }
  return DEFAULT_CONFIG;
})();

let fetchPromise: Promise<AppRuntimeConfig> | null = null;

export async function fetchRuntimeConfig(forceRefresh = false): Promise<AppRuntimeConfig> {
  if (!forceRefresh && fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const targetUrl = `${DEFAULT_CLOUDFLARE_ADMIN_BACKEND_URL}/api/config`;
      const res = await fetch(targetUrl, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        const configData = json.data || json;
        cachedConfig = { ...DEFAULT_CONFIG, ...configData };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('app_runtime_config', JSON.stringify(cachedConfig));
            if (cachedConfig.googleMapsPlatformKey) {
              localStorage.setItem('googleMapsApiKey', cachedConfig.googleMapsPlatformKey);
            }
          } catch {}
        }
        return cachedConfig;
      }
    } catch {
      // In case worker is unreachable, fallback to relative /api/config
      try {
        const fallbackRes = await fetch('/api/config');
        if (fallbackRes.ok) {
          const json = await fallbackRes.json();
          cachedConfig = { ...DEFAULT_CONFIG, ...(json.data || json) };
          return cachedConfig;
        }
      } catch {}
    }
    return cachedConfig;
  })();

  return fetchPromise;
}

export function getRuntimeConfig(): AppRuntimeConfig {
  return cachedConfig;
}

export function getGoogleMapsKey(fallback = ''): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('googleMapsApiKey');
    if (stored && stored.trim() && stored !== 'YOUR_API_KEY') {
      return stored.trim();
    }
  }
  return cachedConfig.googleMapsPlatformKey || fallback || '';
}

export function getVapidPublicKey(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('vapid_public_key');
    if (stored && stored.trim()) return stored.trim();
  }
  return cachedConfig.vapidPublicKey || '';
}

// Auto-trigger config preload on module initialization
if (typeof window !== 'undefined') {
  fetchRuntimeConfig().catch(() => {});
}
