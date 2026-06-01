import { handleError } from '../../../shared/utils/errorHandler';
import type { ExtensionMessage } from '../../../shared/types/messages';
import type { FormatType } from '../../../shared/types/formatMemory';
import { htmlToMarkdown, htmlToBBCode, htmlToPlainText, htmlToRawText } from '../../../shared/utils/converters';

// ----------------------------------------------------------------------------
// State and helpers for double‑right‑click detection
// ----------------------------------------------------------------------------
let lastContextMenuTime = 0;
let contextMenuTimer: number | null = null;

// ----------------------------------------------------------------------------
// Fetch active profile data (masterHTML)
// ----------------------------------------------------------------------------
async function getMasterHTML(): Promise<string> {
  try {
    const message: ExtensionMessage = { type: 'GET_PROFILE_DATA' };
    const response = await new Promise<{ data: { masterHTML: string } | null }>((resolve, reject) => {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(resp);
      });
    });
    return response.data?.masterHTML || '';
  } catch (err) {
    handleError('ContextMenu.getMasterHTML', err, 'Failed to fetch profile data');
    return '';
  }
}

// ----------------------------------------------------------------------------
// Get saved format for current domain
// ----------------------------------------------------------------------------
async function getSavedFormat(domain: string): Promise<FormatType | null> {
  try {
    const message: ExtensionMessage = { type: 'GET_FORMAT_MEMORY', payload: { domain } };
    const response = await new Promise<{ format: FormatType | null }>((resolve, reject) => {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(resp);
      });
    });
    return response.format;
  } catch (err) {
    handleError('ContextMenu.getSavedFormat', err, 'Failed to get saved format');
    return null;
  }
}

// ----------------------------------------------------------------------------
// Save format preference for current domain
// ----------------------------------------------------------------------------
async function saveFormat(domain: string, format: FormatType): Promise<void> {
  try {
    const message: ExtensionMessage = { type: 'SET_FORMAT_MEMORY', payload: { domain, format } };
    await new Promise<void>((resolve, reject) => {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve();
      });
    });
  } catch (err) {
    handleError('ContextMenu.saveFormat', err, 'Failed to save format preference');
  }
}

// ----------------------------------------------------------------------------
// Convert HTML to the chosen format
// ----------------------------------------------------------------------------
function convertHTML(html: string, format: FormatType): string {
  switch (format) {
    case 'HTML Code (Clean)':
      // Clean HTML (remove extra whitespace, but keep structure)
      return html.replace(/&nbsp;/g, ' ').trim();
    case 'Plain Text':
      return htmlToPlainText(html);
    case 'Raw Text':
      return htmlToRawText(html);
    case 'Markdown (Inline)':
      return htmlToMarkdown(html);
    case 'BBCode':
      return htmlToBBCode(html);
    case 'Markdown (Reference)':
      // For reference markdown, we use the same as inline? Actually needs special handling.
      // For simplicity, we'll use inline markdown; full ref implementation can be added later.
      return htmlToMarkdown(html);
    case 'Rich Text':
      return html;
    default:
      return html;
  }
}

// ----------------------------------------------------------------------------
// Paste text/html into the currently focused editable element
// ----------------------------------------------------------------------------
async function pasteIntoActiveElement(content: string, isRich: boolean): Promise<void> {
  const activeEl = document.activeElement as HTMLElement;
  if (!activeEl) return;

  // Try to use execCommand for contenteditable or text inputs
  if (activeEl.isContentEditable) {
    // For contenteditable, we can use execCommand('insertHTML')
    document.execCommand('insertHTML', false, content);
    return;
  }

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

  // Fallback: try to paste as plain text via clipboard (may require user permission)
  try {
    await navigator.clipboard.writeText(content);
    document.execCommand('paste');
  } catch (err) {
    console.warn('ContextMenu: clipboard paste failed', err);
  }
}

// ----------------------------------------------------------------------------
// Show the format selection menu
// ----------------------------------------------------------------------------
function showFormatMenu(domain: string, masterHTML: string, x: number, y: number): void {
  // Remove any existing menu
  const existing = document.getElementById('llb-context-menu');
  if (existing) existing.remove();

  const formats: FormatType[] = [
    'HTML Code (Clean)',
    'Plain Text',
    'Raw Text',
    'Markdown (Inline)',
    'BBCode',
    'Rich Text',
  ];

  const menu = document.createElement('div');
  menu.id = 'llb-context-menu';
  menu.className = 'llb-fixed llb-bg-white llb-border llb-border-slate-200 llb-rounded-lg llb-shadow-xl llb-z-[2147483647] llb-min-w-[200px] llb-py-1';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  for (const fmt of formats) {
    const item = document.createElement('div');
    item.textContent = fmt;
    item.className = 'llb-px-4 llb-py-2 llb-text-sm llb-cursor-pointer llb-hover:llb-bg-slate-100 llb-transition-colors';
    item.onclick = async () => {
      const converted = convertHTML(masterHTML, fmt);
      await pasteIntoActiveElement(converted, fmt === 'Rich Text');
      await saveFormat(domain, fmt);
      menu.remove();
    };
    menu.appendChild(item);
  }

  document.body.appendChild(menu);

  // Click outside to close
  const closeHandler = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
      document.removeEventListener('click', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 0);
}

// ----------------------------------------------------------------------------
// Main contextmenu handler (detects double right‑click)
// ----------------------------------------------------------------------------
async function onContextMenu(event: MouseEvent): Promise<void> {
  const now = Date.now();
  const isDoubleClick = (now - lastContextMenuTime) < 500;
  lastContextMenuTime = now;

  // Clear any pending timer
  if (contextMenuTimer) clearTimeout(contextMenuTimer);

  if (!isDoubleClick) {
    // Single right‑click – wait a bit to see if a second click follows
    contextMenuTimer = window.setTimeout(() => {
      contextMenuTimer = null;
    }, 500);
    return;
  }

  // Double right‑click detected
  event.preventDefault();
  event.stopPropagation();

  const masterHTML = await getMasterHTML();
  if (!masterHTML) {
    console.warn('[ContextMenu] No master HTML found in active profile');
    return;
  }

  const domain = window.location.hostname;
  const savedFormat = await getSavedFormat(domain);
  const isOverride = event.ctrlKey && event.shiftKey; // Ctrl+Shift+Right‑Click forces menu
  const shouldShowMenu = !savedFormat || isOverride;

  if (shouldShowMenu) {
    showFormatMenu(domain, masterHTML, event.clientX, event.clientY);
  } else {
    // Use saved format
    const converted = convertHTML(masterHTML, savedFormat);
    await pasteIntoActiveElement(converted, savedFormat === 'Rich Text');
  }
}

// ----------------------------------------------------------------------------
// Initialisation and cleanup
// ----------------------------------------------------------------------------
export function init(): () => void {
  document.addEventListener('contextmenu', onContextMenu);
  return () => {
    document.removeEventListener('contextmenu', onContextMenu);
    const menu = document.getElementById('llb-context-menu');
    if (menu) menu.remove();
    if (contextMenuTimer) clearTimeout(contextMenuTimer);
  };
}