/**
 * Timezone field detection patterns.
 *
 * Exports a FieldPatternRule for timezone and tz inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'timezone',
  patterns: [
    /time_?zone/i,
    /tz/i,
  ],
  description: 'Timezone',
};