// src/shared/types/profile.ts
import type { IProfile, IProfileData } from './storage';

export type { IProfile, IProfileData };

/**
 * Payload for creating a new profile.
 */
export interface CreateProfilePayload {
  name: string;
  data: IProfileData;
}

/**
 * Payload for updating an existing profile.
 */
export interface UpdateProfilePayload {
  name?: string;
  data?: Partial<IProfileData>;
}

/**
 * Lightweight profile summary for listing.
 */
export interface ProfileSummary {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Type guard for IProfile.
 */
export function isIProfile(obj: unknown): obj is IProfile {
  if (obj === null || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.data === 'object' &&
    candidate.data !== null &&
    typeof candidate.createdAt === 'number' &&
    typeof candidate.updatedAt === 'number'
  );
}