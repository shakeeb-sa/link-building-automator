/**
 * Gender / sex field detection patterns.
 *
 * Exports a FieldPatternRule for gender and sex inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'gender',
  patterns: [
    /gender/i,
    /sex/i,
  ],
  description: 'Gender',
};