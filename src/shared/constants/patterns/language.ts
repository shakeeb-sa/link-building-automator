/**
 * Language field detection patterns.
 *
 * Exports a FieldPatternRule for language and lang inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'language',
  patterns: [
    /language/i,
    /lang/i,
  ],
  description: 'Language',
};