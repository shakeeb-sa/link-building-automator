/**
 * Handles postMessage events from the web app to sync project details
 * into the extension's active profile.
 *
 * Provides a setup function to add the event listener and a cleanup function
 * to remove it.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import { isProjectDataMessage } from '../shared/types/webAppMessages';
import { mapFieldsToProfileData } from '../shared/utils/profileMapper';
import type { ExtensionMessage } from '../shared/types/messages';
import { handleError } from '../shared/utils/errorHandler';

/**
 * Handles an incoming MessageEvent from the web app.
 * Validates the data, maps fields to a profile update,
 * and sends the update to the background script.
 */
async function handleWebAppMessage(event: MessageEvent): Promise<void> {
  // Validate the message structure using the type guard
  if (!isProjectDataMessage(event.data)) return;

  const { title, fields } = event.data.payload;
  const profileUpdate = mapFieldsToProfileData(fields, title);
  const hasAnyField = Object.values(profileUpdate).some(
    (value) => value !== undefined && value !== ''
  );

  if (!hasAnyField) {
    // No fields were mapped – show an info toast
    chrome.runtime.sendMessage({
      type: 'SHOW_TOAST',
      payload: { message: 'No matching fields found in project data', type: 'info' },
    } as ExtensionMessage);
    return;
  }

  try {
    const response = await new Promise<{ success: boolean; error?: string }>(
      (resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'UPDATE_PROFILE_DATA',
            payload: profileUpdate,
          } as ExtensionMessage,
          (resp) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(resp);
            }
          }
        );
      }
    );

    if (response.success) {
      chrome.runtime.sendMessage({
        type: 'SHOW_TOAST',
        payload: { message: 'Profile updated from Project Details', type: 'success' },
      } as ExtensionMessage);
    } else if (response.error === 'No active profile') {
      chrome.runtime.sendMessage({
        type: 'SHOW_TOAST',
        payload: {
          message: 'No active profile – please create or activate one first',
          type: 'error',
        },
      } as ExtensionMessage);
    } else {
      chrome.runtime.sendMessage({
        type: 'SHOW_TOAST',
        payload: { message: `Profile update failed: ${response.error}`, type: 'error' },
      } as ExtensionMessage);
    }
  } catch (err) {
    handleError('webAppMessageHandler', err, 'Failed to update profile from project data');
  }
}

/**
 * Sets up the postMessage event listener.
 * @returns A cleanup function that removes the event listener.
 */
export function setupWebAppMessageListener(): () => void {
  window.addEventListener('message', handleWebAppMessage);
  return () => {
    window.removeEventListener('message', handleWebAppMessage);
  };
}