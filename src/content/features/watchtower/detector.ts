import type { ExtensionMessage } from '../../../shared/types/messages';
import type { IWatchtowerStatus } from '../../../shared/types/watchtower';
import { handleError } from '../../../shared/utils/errorHandler';

/**
 * Queries the watchtower status for a given domain.
 * @param domain – normalised domain (e.g., 'example.com')
 * @returns Promise resolving to IWatchtowerStatus
 */
export async function getWatchtowerStatus(domain: string): Promise<IWatchtowerStatus> {
  try {
    const message: ExtensionMessage = { type: 'GET_WATCHTOWER_STATUS', payload: { domain } };
    const response = await new Promise<IWatchtowerStatus>((resolve, reject) => {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(resp);
      });
    });
    return response;
  } catch (err) {
    handleError('Watchtower.detector.getStatus', err, 'Failed to get watchtower status');
    // Fallback: assume not blocked
    return {
      domain,
      isBlocked: false,
      sources: [],
      totalBlockedDomains: 0,
    };
  }
}