/**
 * Fills a text input or textarea with the given value.
 * Dispatches focus, input, change, and blur events.
 */
export function fillElement(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  // Skip if already has the same value
  if (el.value === value) return;

  el.focus();
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.blur();
}

/**
 * Selects an option in a dropdown by matching value or text.
 * If multiple matching options exist, picks the first.
 * @returns true if an option was selected, false otherwise.
 */
export function fillSelect(el: HTMLSelectElement, value: string): boolean {
  for (let i = 0; i < el.options.length; i++) {
    const option = el.options[i];
    if (option.value === value || option.text === value) {
      if (el.selectedIndex === i) return true;
      el.selectedIndex = i;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  }
  return false;
}

/**
 * Checks or unchecks a checkbox and dispatches change event.
 */
export function fillCheckbox(el: HTMLInputElement, checked: boolean): void {
  if (el.checked === checked) return;
  el.checked = checked;
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Selects a radio button by its value within a group (by name).
 * If a radio with the exact value is found, it is checked.
 * @returns true if a radio was selected, false otherwise.
 */
export function fillRadioGroup(name: string, value: string): boolean {
  const radios = document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${name}"]`);
  for (const radio of radios) {
    if (radio.value === value) {
      if (!radio.checked) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return true;
    }
  }
  return false;
}

/**
 * Placeholder for file input filling.
 * File inputs cannot be auto‑filled due to browser security restrictions.
 * This function does nothing and logs a warning.
 */
export function fillFileInput(el: HTMLInputElement, _filePath?: string): void {
  console.warn('[formFiller] File inputs cannot be auto‑filled for security reasons.', el);
}