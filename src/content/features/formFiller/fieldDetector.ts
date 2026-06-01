import { FIELD_PATTERNS, detectFieldType as sharedDetectFieldType, type FieldType } from '../../../shared/constants/patterns';

/**
 * Gathers all relevant text from an element and its surrounding labels.
 * @param el - The HTML element (input, textarea, select)
 * @returns A combined lowercase string of all available clues.
 */
function getElementTextContext(el: HTMLElement): string {
  const clues: string[] = [];

  // Element's own attributes
  if (el.id) clues.push(el.id);
  if (el.getAttribute('name')) clues.push(el.getAttribute('name')!);
  if (el.getAttribute('placeholder')) clues.push(el.getAttribute('placeholder')!);
  if (el.getAttribute('autocomplete')) clues.push(el.getAttribute('autocomplete')!);
  if (el.getAttribute('aria-label')) clues.push(el.getAttribute('aria-label')!);
  if (el.getAttribute('title')) clues.push(el.getAttribute('title')!);

  // Label associated via 'for' attribute
  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    if (label) clues.push(label.textContent || '');
  }

  // Closest label (if element is inside a label)
  const parentLabel = el.closest('label');
  if (parentLabel) clues.push(parentLabel.textContent || '');

  // Text from previous sibling or parent (common in some layouts)
  const prevSibling = el.previousElementSibling;
  if (prevSibling && prevSibling.textContent) clues.push(prevSibling.textContent);
  const parentDiv = el.closest('div');
  if (parentDiv && parentDiv.textContent && parentDiv.textContent.length < 200) {
    clues.push(parentDiv.textContent);
  }

  return clues.join(' ').toLowerCase().trim();
}

/**
 * Detects the field type for a given HTML element based on its context.
 * @param el - The form element (input, textarea, select)
 * @returns The detected FieldType (e.g., 'username', 'email', 'unknown')
 */
export function detectFieldType(el: HTMLElement): FieldType {
  const text = getElementTextContext(el);
  return sharedDetectFieldType(text);
}