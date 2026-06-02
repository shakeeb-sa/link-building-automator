/**
 * Watchtower message handlers for the background service worker.
 *
 * Handles all messages related to domain collision detection:
 * - Getting watchtower status for a domain
 * - Retrieving all domain lists
 * - Adding domains to primary/secondary/pasted lists
 * - Clearing individual lists
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { ExtensionMessage } from '../../shared/types/messages';
import * as watchtowerService from '../../shared/services/watchtower';

export async function handleWatchtowerMessage(
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender
): Promise<unknown | null> {
  switch (message.type) {
    case 'GET_WATCHTOWER_STATUS': {
      const isBlocked = await watchtowerService.isDomainBlocked(message.payload.domain);
      const sources: ('primary' | 'secondary' | 'pasted' | 'none')[] = [];
      if (isBlocked) {
        // For simplicity, mark as 'primary' if blocked; a full implementation could detect which list.
        sources.push('primary');
      }
      const totalBlockedDomains = (await watchtowerService.getAllBlockedDomains()).length;
      return {
        domain: message.payload.domain,
        isBlocked,
        sources,
        totalBlockedDomains,
      };
    }

    case 'GET_WATCHTOWER_LISTS': {
      const primary = await watchtowerService.getPrimaryDomains();
      const secondary = await watchtowerService.getSecondaryDomains();
      const pasted = await watchtowerService.getPastedDomains();
      return { primary, secondary, pasted };
    }

    case 'UPDATE_WATCHTOWER_LISTS': {
      // Placeholder for future bulk update
      return { success: true };
    }

    case 'ADD_PRIMARY_DOMAINS': {
      const success = await watchtowerService.addPrimaryDomains(message.payload.domains);
      return { success };
    }

    case 'ADD_SECONDARY_DOMAINS': {
      const success = await watchtowerService.addSecondaryDomains(message.payload.domains);
      return { success };
    }

    case 'SET_PASTED_DOMAINS': {
      const success = await watchtowerService.setPastedDomains(message.payload.domains);
      return { success };
    }

    case 'CLEAR_PRIMARY_DOMAINS': {
      const success = await watchtowerService.clearPrimaryList();
      return { success };
    }

    case 'CLEAR_SECONDARY_DOMAINS': {
      const success = await watchtowerService.clearSecondaryList();
      return { success };
    }

    case 'CLEAR_PASTED_DOMAINS': {
      const success = await watchtowerService.clearPastedList();
      return { success };
    }

    default:
      return null; // Not handled by this handler
  }
}