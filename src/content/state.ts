/**
 * Master switch state management for content script.
 *
 * Loads, stores, and provides access to the master switch enabled status.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

let masterEnabled = true;

export async function loadMasterState(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['masterSwitchEnabled'], (result) => {
      if (chrome.runtime.lastError) {
        masterEnabled = true;
      } else {
        masterEnabled = result.masterSwitchEnabled !== false;
      }
      resolve();
    });
  });
}

export function isMasterEnabled(): boolean {
  return masterEnabled;
}

export function setMasterEnabled(enabled: boolean): void {
  masterEnabled = enabled;
}

export function getMasterEnabled(): boolean {
  return masterEnabled;
}