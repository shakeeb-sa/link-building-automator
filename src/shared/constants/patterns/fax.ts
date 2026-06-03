/**
 * Fax number field detection patterns.
 *
 * Exports a FieldPatternRule for fax number inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'fax',
  patterns: [
    /fax/i,
    /fax-?number/i,
  ],
  description: 'Fax number',
};