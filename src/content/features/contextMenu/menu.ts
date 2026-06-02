/**
 * Menu UI for context menu feature.
 *
 * Builds and displays a floating menu with format options.
 * Handles conversion and pasting when a format is selected.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FormatType } from '../../../shared/types/formatMemory';
import { htmlToMarkdown, htmlToBBCode, htmlToPlainText, htmlToRawText } from '../../../shared/utils/converters';
import { pasteIntoActiveElement } from './paster';
import { saveFormat } from './fetcher';

function convertHTML(html: string, format: FormatType): string {
  switch (format) {
    case 'HTML Code (Clean)':
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
      // For simplicity, use inline markdown; full ref implementation can be added later.
      return htmlToMarkdown(html);
    case 'Rich Text':
      return html;
    default:
      return html;
  }
}

export function removeMenu(): void {
  const existing = document.getElementById('llb-context-menu');
  if (existing) existing.remove();
}

export function showFormatMenu(domain: string, masterHTML: string, x: number, y: number): void {
  removeMenu();

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
      removeMenu();
    };
    menu.appendChild(item);
  }

  document.body.appendChild(menu);

  // Click outside to close
  const closeHandler = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      removeMenu();
      document.removeEventListener('click', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 0);
}