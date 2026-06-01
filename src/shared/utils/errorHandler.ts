import type { ExtensionMessage, ShowToastMessage } from '../types/messages';

/**
 * Safely converts an unknown error value to a human‑readable string.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  if (err !== null && typeof err === 'object') {
    try {
      return JSON.stringify(err);
    } catch {
      return 'Unknown error object';
    }
  }
  return 'Unknown error occurred';
}

/**
 * Logs an error to the console with a context prefix.
 * @param context – e.g., 'FormFiller', 'Watchtower', 'Popup'
 * @param err – the caught error (unknown)
 */
export function logError(context: string, err: unknown): void {
  const message = getErrorMessage(err);
  console.error(`[Lightning LinkBuilder][${context}]`, message);
}

/**
 * Sends a toast notification to the popup (if open).
 * This uses chrome.runtime.sendMessage and does not wait for a response.
 */
export function showErrorToast(message: string): void {
  const toastMessage: ShowToastMessage = {
    type: 'SHOW_TOAST',
    payload: { message, type: 'error' },
  };
  // Send to popup (if open) – ignore any errors (popup might be closed)
  chrome.runtime.sendMessage(toastMessage).catch(() => {
    // Popup not open, ignore
  });
}

/**
 * Central error handler: logs, shows toast, returns formatted error message.
 * @param context – feature context
 * @param err – caught error
 * @param fallbackMessage – optional custom message to show to user (defaults to generic)
 * @returns error message string
 */
export function handleError(
  context: string,
  err: unknown,
  fallbackMessage = 'An unexpected error occurred.'
): string {
  const errorMessage = getErrorMessage(err);
  logError(context, err);
  showErrorToast(fallbackMessage);
  return errorMessage;
}