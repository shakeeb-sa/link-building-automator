import type { IProfile } from '../types/profile';
import type { IFormatMemory } from '../types/formatMemory';
import type { IUnusedBacklinksCategorized } from '../types/unusedBacklinks';
import { handleError } from '../utils/errorHandler';

// ============================================================================
// Configuration
// ============================================================================

// Base URL for the LinkFlow Pro API (can be overridden in development)
const API_BASE_URL = process.env.PLASMO_PUBLIC_API_BASE_URL || 'https://api.linkflowpro.com/v1';
let authToken: string | null = null;

// ============================================================================
// Token Management
// ============================================================================

/**
 * Sets the JWT token for authenticated requests.
 */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/**
 * Retrieves the current JWT token.
 */
export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Clears the JWT token (logout).
 */
export function clearAuthToken(): void {
  authToken = null;
}

// ============================================================================
// Internal HTTP Client
// ============================================================================

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  body?: unknown;
  requiresAuth?: boolean;
}

async function request<T>(options: RequestOptions): Promise<T> {
  const { method, endpoint, body, requiresAuth = true } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    if (!authToken) {
      throw new Error('No authentication token available');
    }
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = `API error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  // For 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ============================================================================
// Public API Methods (to be implemented when backend is ready)
// ============================================================================

/**
 * Health check – verifies API connectivity and authentication.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    await request<{ status: string }>({
      method: 'GET',
      endpoint: '/health',
      requiresAuth: false,
    });
    return true;
  } catch (err) {
    handleError('ApiClient.health', err, 'API health check failed');
    return false;
  }
}

/**
 * Syncs all profiles to the cloud (upsert).
 * @param profiles – array of profiles to sync
 */
export async function syncProfiles(profiles: IProfile[]): Promise<boolean> {
  try {
    await request<{ success: boolean }>({
      method: 'POST',
      endpoint: '/profiles/sync',
      body: { profiles },
    });
    return true;
  } catch (err) {
    handleError('ApiClient.syncProfiles', err, 'Failed to sync profiles');
    return false;
  }
}

/**
 * Syncs watchtower domain lists to the cloud.
 * @param domains – array of blocked domain strings
 */
export async function syncWatchtower(domains: string[]): Promise<boolean> {
  try {
    await request<{ success: boolean }>({
      method: 'POST',
      endpoint: '/watchtower/sync',
      body: { domains },
    });
    return true;
  } catch (err) {
    handleError('ApiClient.syncWatchtower', err, 'Failed to sync watchtower');
    return false;
  }
}

/**
 * Syncs per‑domain format memory to the cloud.
 * @param formats – object mapping domain → format type
 */
export async function syncFormatMemory(formats: IFormatMemory): Promise<boolean> {
  try {
    await request<{ success: boolean }>({
      method: 'POST',
      endpoint: '/format-memory/sync',
      body: { formats },
    });
    return true;
  } catch (err) {
    handleError('ApiClient.syncFormatMemory', err, 'Failed to sync format memory');
    return false;
  }
}

/**
 * Syncs unused backlinks categorization to the cloud.
 * @param categorized – mapping sheet name → array of URLs
 */
export async function syncUnusedBacklinks(categorized: IUnusedBacklinksCategorized): Promise<boolean> {
  try {
    await request<{ success: boolean }>({
      method: 'POST',
      endpoint: '/unused-backlinks/sync',
      body: { categorized },
    });
    return true;
  } catch (err) {
    handleError('ApiClient.syncUnusedBacklinks', err, 'Failed to sync unused backlinks');
    return false;
  }
}

/**
 * Fetches the latest watchtower list from the cloud for the authenticated user.
 */
export async function fetchCloudWatchtower(): Promise<string[]> {
  try {
    const response = await request<{ domains: string[] }>({
      method: 'GET',
      endpoint: '/watchtower',
    });
    return response.domains;
  } catch (err) {
    handleError('ApiClient.fetchCloudWatchtower', err, 'Failed to fetch watchtower from cloud');
    return [];
  }
}