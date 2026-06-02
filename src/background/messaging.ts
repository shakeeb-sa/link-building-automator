// src/background/messaging.ts
import type { ExtensionMessage } from '../shared/types/messages';
import type { IProfileData, FormatType } from '../shared/types/storage';
import * as profileService from '../shared/services/profileService';
import * as watchtowerService from '../shared/services/watchtowerService';
import * as formatMemoryService from '../shared/services/formatMemoryService';
import * as unusedBacklinksService from '../shared/services/unusedBacklinksService';
import { handleError } from '../shared/utils/errorHandler';
import { getFlattenedProfileData } from '../shared/services/storage';

export function setupMessageRouter(): void {
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, sender, sendResponse) => {
      handleMessage(message, sender)
        .then((response) => sendResponse(response))
        .catch((err) => {
          handleError('Messaging.handleMessage', err, 'Message handling failed');
          sendResponse({ success: false, error: 'Internal error' });
        });
      return true;
    }
  );
}

async function handleMessage(
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender
): Promise<unknown> {
  switch (message.type) {
    // ------------------------------------------------------------------------
    // Profile messages
    // ------------------------------------------------------------------------
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

    // ------------------------------------------------------------------------
    // Watchtower messages
    // ------------------------------------------------------------------------
    case 'GET_WATCHTOWER_STATUS': {
      const isBlocked = await watchtowerService.isDomainBlocked(message.payload.domain);
      const sources: ('primary' | 'secondary' | 'pasted' | 'none')[] = [];
      if (isBlocked) sources.push('primary');
      const totalBlockedDomains = (await watchtowerService.getAllBlockedDomains()).length;
      return {
        domain: message.payload.domain,
        isBlocked,
        sources,
        totalBlockedDomains,
      };
    }

    case 'UPDATE_WATCHTOWER_LISTS': {
      return { success: true };
    }

    // ------------------------------------------------------------------------
    // Format Memory messages
    // ------------------------------------------------------------------------
    case 'GET_FORMAT_MEMORY': {
      const format = await formatMemoryService.getFormat(message.payload.domain);
      return { format };
    }

    case 'SET_FORMAT_MEMORY': {
      const success = await formatMemoryService.setFormat(
        message.payload.domain,
        message.payload.format
      );
      return { success };
    }

    // ------------------------------------------------------------------------
    // Unused Backlinks messages
    // ------------------------------------------------------------------------
    case 'GET_UNUSED_BACKLINKS': {
      const categorized = await unusedBacklinksService.getCategorized();
      const allUrls: string[] = [];
      for (const urls of Object.values(categorized)) {
        allUrls.push(...urls);
      }
      const history = await unusedBacklinksService.getHistory();
      const available = allUrls.filter((url) => !history.includes(url));
      const batch = available.slice(0, 5);
      await unusedBacklinksService.addToHistory(batch);
      return {
        batch: {
          urls: batch,
          totalRemaining: available.length,
          activeSheetCount: Object.keys(categorized).length,
        },
      };
    }

    case 'SHUFFLE_BACKLINKS': {
      const categorized = await unusedBacklinksService.getCategorized();
      const activeSheets = message.payload.sheetNames ?? Object.keys(categorized);
      let allUrls: string[] = [];
      for (const sheet of activeSheets) {
        const urls = await unusedBacklinksService.getUniqueUrlsFromCategory(sheet);
        allUrls.push(...urls);
      }
      const shuffled = [...allUrls].sort(() => 0.5 - Math.random());
      const batch = shuffled.slice(0, 5);
      await unusedBacklinksService.addToHistory(batch);
      return {
        batch: {
          urls: batch,
          totalRemaining: allUrls.length,
          activeSheetCount: activeSheets.length,
        },
      };
    }

    // ------------------------------------------------------------------------
    // UI Feedback
    // ------------------------------------------------------------------------
    case 'SHOW_TOAST': {
      return { success: true };
    }

    // ------------------------------------------------------------------------
    // Navigation – handled in navigation.ts; just acknowledge
    // ------------------------------------------------------------------------
    case 'ACTIVATE_FAKEMAIL':
    case 'ACTIVATE_CONVERTER': {
      return { success: true };
    }

    // ------------------------------------------------------------------------
    // Toggle messages
    // ------------------------------------------------------------------------
    case 'MASTER_SWITCH_TOGGLE': {
      return { success: true };
    }

    case 'GOLD_MINE_SHUFFLE': {
      return {
        batch: {
          urls: [],
          totalRemaining: 0,
          activeSheetCount: 0,
        },
      };
    }

    // ------------------------------------------------------------------------
    // Gateway Hunter (open overlay menu)
    // ------------------------------------------------------------------------
    case 'OPEN_GATEWAY_MENU': {
      // Forward to the active tab's content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, message);
      }
      return { success: true };
    }

    // ------------------------------------------------------------------------
    // Gold Mine Toggle
    // ------------------------------------------------------------------------
    case 'TOGGLE_GOLD_MINE': {
      const { enabled } = message.payload;
      await chrome.storage.local.set({ goldMineEnabled: enabled });
      // Broadcast to all tabs
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, message).catch(() => {});
        }
      }
      return { success: true };
    }

    // ------------------------------------------------------------------------
    // Context menu paste – not used in background
    // ------------------------------------------------------------------------
    case 'CONTEXT_MENU_PASTE': {
      return { success: true };
    }

    // ------------------------------------------------------------------------
    // Additional message types (implemented elsewhere or placeholders)
    // ------------------------------------------------------------------------
    case 'GET_ALL_PROFILES':
    case 'CREATE_PROFILE':
    case 'UPDATE_PROFILE':
    case 'DELETE_PROFILE':
    case 'ADD_PRIMARY_DOMAINS':
    case 'ADD_SECONDARY_DOMAINS':
    case 'SET_PASTED_DOMAINS':
    case 'CLEAR_PRIMARY_DOMAINS':
    case 'CLEAR_SECONDARY_DOMAINS':
    case 'CLEAR_PASTED_DOMAINS':
    case 'GET_ALL_FORMATS':
    case 'DELETE_FORMAT':
    case 'CLEAR_ALL_FORMATS': {
      return { success: false, error: 'Not implemented' };
    }

    default: {
      // Exhaustive check – all union members must be handled above
      const exhaustiveCheck: never = message;
      throw new Error(`Unhandled message type: ${(exhaustiveCheck as ExtensionMessage).type}`);
    }
  }
}