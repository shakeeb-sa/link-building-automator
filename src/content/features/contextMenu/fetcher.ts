/**
 * Data fetcher for context menu feature.
 *
 * Provides functions to get masterHTML from active profile,
 * and to get/set format preferences per domain.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { ExtensionMessage } from '../../../shared/types/messages';
import type { FormatType } from '../../../shared/types/formatMemory';
import { handleError } from '../../../shared/utils/errorHandler';

export async function getMasterHTML(): Promise<string> {
  try {
    const message: ExtensionMessage = { type: 'GET_PROFILE_DATA' };
    const response = await new Promise<{ data: { masterHTML: string } | null }>((resolve, reject) => {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(resp);
        }
      });
    });
    return response.data?.masterHTML || '';
  } catch (err) {
    handleError('ContextMenu.getMasterHTML', err, 'Failed to fetch profile data');
    return '';
  }
}

export async function getSavedFormat(domain: string): Promise<FormatType | null> {
  try {
    const message: ExtensionMessage = { type: 'GET_FORMAT_MEMORY', payload: { domain } };
    const response = await new Promise<{ format: FormatType | null }>((resolve, reject) => {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(resp);
        }
      });
    });
    return response.format;
  } catch (err) {
    handleError('ContextMenu.getSavedFormat', err, 'Failed to get saved format');
    return null;
  }
}

export async function saveFormat(domain: string, format: FormatType): Promise<void> {
  try {
    const message: ExtensionMessage = { type: 'SET_FORMAT_MEMORY', payload: { domain, format } };
    await new Promise<void>((resolve, reject) => {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  } catch (err) {
    handleError('ContextMenu.saveFormat', err, 'Failed to save format preference');
  }
}