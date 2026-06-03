/**
 * State, province, region, and county field detection patterns.
 *
 * Exports a FieldPatternRule for state, province, region, county, and related inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'state',
  patterns: [
    /state/i,
    /province/i,
    /region/i,
    /county/i,
    /state\/province/i,
    /state\/region/i,
    /state-?code/i,
  ],
  description: 'State/province/region',
};