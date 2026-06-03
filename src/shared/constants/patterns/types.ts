/**
 * Field pattern rule interface.
 *
 * Each rule associates a FieldType with an array of regex patterns
 * and an optional description.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldType } from '../fieldTypes';

export interface FieldPatternRule {
  fieldType: FieldType;
  patterns: RegExp[];
  description?: string;
}