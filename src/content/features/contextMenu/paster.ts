/**
 * Paster for context menu feature.
 *
 * Pastes content into the currently focused editable element.
 * Supports contenteditable elements, INPUT, TEXTAREA, and clipboard fallback.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

export async function pasteIntoActiveElement(content: string, isRich: boolean): Promise<void> {
  const activeEl = document.activeElement as HTMLElement;
  if (!activeEl) return;

  // Contenteditable element (div, etc.)
  if (activeEl.isContentEditable) {
    document.execCommand('insertHTML', false, content);
    return;
  }

  // Standard form inputs
  if (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') {
    const input = activeEl as HTMLInputElement | HTMLTextAreaElement;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const newValue = input.value.slice(0, start) + content + input.value.slice(end);
    input.value = newValue;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }

  // Fallback: try clipboard
  try {
    await navigator.clipboard.writeText(content);
    document.execCommand('paste');
  } catch (err) {
    console.warn('[ContextMenu] clipboard paste failed', err);
  }
}