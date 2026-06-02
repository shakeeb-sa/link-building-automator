import { handleError } from '../../../shared/utils/errorHandler';
import type { ExtensionMessage } from '../../../shared/types/messages';
import type { IProfileData } from '../../../shared/types/profile';
import { detectFieldType } from '../../../shared/constants/patterns';
import { fillElement, fillSelect, fillCheckbox, fillRadioGroup } from './filler';
import { setupClickCounter, destroyClickCounter } from './gestures';
import { shockwaveFill } from './shockwave';

let currentProfileData: IProfileData | null = null;
let isFilling = false;

async function fetchActiveProfile(): Promise<IProfileData | null> {
  return new Promise((resolve) => {
    const message: ExtensionMessage = { type: 'GET_PROFILE_DATA' };
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        handleError('formFiller.fetchActiveProfile', chrome.runtime.lastError, 'Failed to fetch profile data');
        resolve(null);
      } else {
        resolve(response?.data || null);
      }
    });
  });
}

async function refreshProfileData(): Promise<void> {
  currentProfileData = await fetchActiveProfile();
}

async function fillAllFields(): Promise<void> {
  if (isFilling) return;
  isFilling = true;
  try {
    if (!currentProfileData) {
      await refreshProfileData();
    }
    if (!currentProfileData) {
      console.warn('[formFiller] No active profile data');
      return;
    }

    const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="file"]), textarea, select'
    );

    for (const el of inputs) {
      if (el.disabled) continue;
      if ('readOnly' in el && el.readOnly) continue;
      if (el.value && el.value.trim() !== '') continue;

      let placeholder = '';
      if ('placeholder' in el) {
        placeholder = el.placeholder || '';
      }

      const type = detectFieldType(el.id + ' ' + el.name + ' ' + placeholder + ' ' + (el.getAttribute('aria-label') || ''));
      let value: string | null = null;

      switch (type) {
        case 'username': value = currentProfileData.username; break;
        case 'email': value = currentProfileData.email; break;
        case 'secondaryEmail': value = currentProfileData.email; break;
        case 'password': value = currentProfileData.password; break;
        case 'firstName': value = currentProfileData.firstName; break;
        case 'lastName': value = currentProfileData.lastName; break;
        case 'fullName': value = `${currentProfileData.firstName} ${currentProfileData.lastName}`.trim(); break;
        case 'phone': value = currentProfileData.phone; break;
        case 'fax': value = currentProfileData.phone; break;
        case 'address': value = currentProfileData.address; break;
        case 'city': value = currentProfileData.city; break;
        case 'state': value = currentProfileData.region; break;
        case 'zip': value = currentProfileData.zip; break;
        case 'country': value = currentProfileData.country; break;
        case 'company': value = currentProfileData.company; break;
        case 'website': value = currentProfileData.website; break;
        case 'title': value = currentProfileData.title; break;
        case 'subject': value = currentProfileData.title; break;
        case 'category': value = currentProfileData.category; break;
        case 'price': value = '0'; break;
        case 'social': value = currentProfileData.website; break;
        case 'companySize': value = '1-10'; break;
        case 'billing':
        case 'shipping':
          value = 'United States';
          break;
        default:
          continue;
      }

      if (value !== null) {
        if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
          continue;
        }
        if (el instanceof HTMLSelectElement) {
          fillSelect(el, value);
        } else {
          fillElement(el, value);
        }
      }
    }

    // Handle checkboxes
    const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    for (const cb of checkboxes) {
      if (cb.disabled || cb.checked) continue;
      const label = (cb.closest('label')?.innerText || cb.parentElement?.innerText || cb.getAttribute('aria-label') || '').toLowerCase();
      if (label.includes('agree') || label.includes('accept') || label.includes('terms') || label.includes('privacy')) {
        fillCheckbox(cb, true);
      }
    }

  } catch (err) {
    handleError('formFiller.fillAllFields', err, 'Error filling form');
  } finally {
    isFilling = false;
  }
}

function onQuadClick(event: MouseEvent): void {
  const isCtrl = event.ctrlKey;
  const isAlt = event.altKey;
  const isShift = event.shiftKey;
  if (!isCtrl && !isAlt && !isShift) {
    fillAllFields();
  }
}

function onLongPress(): void {
  shockwaveFill(currentProfileData);
}

// Handle messages from background (keyboard shortcuts, etc.)
function onCommandMessage(message: ExtensionMessage): void {
  // QUAD_FILL triggers the form filling
  if (message.type === 'QUAD_FILL') {
    fillAllFields();
    return;
  }
  // MASTER_SWITCH_TOGGLE does NOT trigger filling; it's only for enabling/disabling.
  if (message.type === 'MASTER_SWITCH_TOGGLE') {
    return;
  }
  // GET_ACTIVE_PROFILE does not trigger filling either.
  if (message.type === 'GET_ACTIVE_PROFILE') {
    return;
  }
  // For any other message, fill as a fallback (legacy)
  fillAllFields();
}

function setupListeners(): void {
  setupClickCounter(onQuadClick, onLongPress);
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
    // Handle MASTER_SWITCH_TOGGLE separately (just acknowledge)
    if (message.type === 'MASTER_SWITCH_TOGGLE') {
      sendResponse({ success: true });
      return false;
    }
    // For all other messages, process via onCommandMessage
    onCommandMessage(message);
    sendResponse({ success: true });
    return false;
  });
}

function destroyListeners(): void {
  destroyClickCounter();
}

export function init(): () => void {
  refreshProfileData().catch(() => {});
  setupListeners();
  return () => {
    destroyListeners();
  };
}