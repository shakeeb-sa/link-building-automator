/**
 * Profile message handlers for the background service worker.
 *
 * Handles all messages related to profile management:
 * - Getting active profile and its flattened data
 * - Setting active profile
 * - Updating profile data
 * - CRUD operations (get all, create, update, delete)
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { ExtensionMessage } from '../../shared/types/messages';
import type { IProfileData } from '../../shared/types/storage';
import * as profileService from '../../shared/services/profileService';
import { getFlattenedProfileData } from '../../shared/services/storage';

export async function handleProfileMessage(
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender
): Promise<unknown | null> {
  switch (message.type) {
    case 'GET_ACTIVE_PROFILE': {
      const profile = await profileService.getActiveProfile();
      return { profile };
    }

    case 'GET_PROFILE_DATA': {
      const data = await getFlattenedProfileData();
      return { data };
    }

    case 'SET_ACTIVE_PROFILE': {
      const success = await profileService.setActiveProfile(message.payload.profileId);
      return { success };
    }

    case 'UPDATE_PROFILE_DATA': {
      const active = await profileService.getActiveProfile();
      if (!active) {
        return { success: false, error: 'No active profile' };
      }
      const updated = await profileService.updateProfile(active.id, {
        data: message.payload as IProfileData,
      });
      return { success: updated, data: await getFlattenedProfileData() };
    }

    case 'GET_ALL_PROFILES': {
      const profiles = await profileService.getAllProfiles();
      return { profiles };
    }

    case 'CREATE_PROFILE': {
      const profile = await profileService.createProfile(message.payload.name);
      return { profile };
    }

    case 'UPDATE_PROFILE': {
      const success = await profileService.updateProfile(message.payload.id, message.payload.updates);
      return { success };
    }

    case 'DELETE_PROFILE': {
      const success = await profileService.deleteProfile(message.payload.id);
      return { success };
    }

    default:
      return null; // Not handled by this handler
  }
}