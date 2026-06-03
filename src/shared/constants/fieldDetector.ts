/**
 * Field detection logic.
 *
 * Determines the FieldType of a form element based on its text context
 * (id, name, placeholder, label text, etc.).
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldType } from './fieldTypes';
import { FIELD_PATTERNS } from './patterns';

/**
 * Helper function to determine field type from element attributes and context.
 * @param text – combined string from id, name, placeholder, autocomplete, label texts
 * @returns FieldType
 */
export function detectFieldType(text: string): FieldType {
  const lower = text.toLowerCase();
  for (const rule of FIELD_PATTERNS) {
    for (const pattern of rule.patterns) {
      if (pattern.test(lower)) {
        return rule.fieldType;
      }
    }
  }
  return 'unknown';
}