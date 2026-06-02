/**
 * Profile message types for the extension's messaging system.
 *
 * Defines all messages related to profile management:
 * - Getting active profile and its flattened data
 * - Setting active profile
 * - Updating profile data
 * - CRUD operations (get all, create, update, delete)
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { BaseMessage } from './base';
import type { IProfile, IProfileData } from '../profile';

// ----------------------------------------------------------------------------
// GET_ACTIVE_PROFILE
// ----------------------------------------------------------------------------
export type GetActiveProfileMessage = BaseMessage<'GET_ACTIVE_PROFILE'>;
export type GetActiveProfileResponse = { profile: IProfile | null };

// ----------------------------------------------------------------------------
// GET_PROFILE_DATA (flattened data for content scripts)
// ----------------------------------------------------------------------------
export type GetProfileDataMessage = BaseMessage<'GET_PROFILE_DATA'>;
export type GetProfileDataResponse = { data: IProfileData | null };

// ----------------------------------------------------------------------------
// SET_ACTIVE_PROFILE
// ----------------------------------------------------------------------------
export type SetActiveProfileMessage = BaseMessage<'SET_ACTIVE_PROFILE'> & {
  payload: { profileId: string };
};
export type SetActiveProfileResponse = { success: boolean };

// ----------------------------------------------------------------------------
// UPDATE_PROFILE_DATA (update fields of the active profile)
// ----------------------------------------------------------------------------
export type UpdateProfileDataMessage = BaseMessage<'UPDATE_PROFILE_DATA'> & {
  payload: Partial<IProfileData>;
};
export type UpdateProfileDataResponse = { success: boolean; data: IProfileData };

// ----------------------------------------------------------------------------
// GET_ALL_PROFILES (list all profiles)
// ----------------------------------------------------------------------------
export type GetAllProfilesMessage = BaseMessage<'GET_ALL_PROFILES'>;
export type GetAllProfilesResponse = { profiles: IProfile[] };

// ----------------------------------------------------------------------------
// CREATE_PROFILE
// ----------------------------------------------------------------------------
export type CreateProfileMessage = BaseMessage<'CREATE_PROFILE'> & {
  payload: { name: string };
};
export type CreateProfileResponse = { profile: IProfile };

// ----------------------------------------------------------------------------
// UPDATE_PROFILE (update name or data of a specific profile by ID)
// ----------------------------------------------------------------------------
export type UpdateProfileMessage = BaseMessage<'UPDATE_PROFILE'> & {
  payload: { id: string; updates: Partial<Pick<IProfile, 'name' | 'data'>> };
};
export type UpdateProfileResponse = { success: boolean };

// ----------------------------------------------------------------------------
// DELETE_PROFILE
// ----------------------------------------------------------------------------
export type DeleteProfileMessage = BaseMessage<'DELETE_PROFILE'> & {
  payload: { id: string };
};
export type DeleteProfileResponse = { success: boolean };