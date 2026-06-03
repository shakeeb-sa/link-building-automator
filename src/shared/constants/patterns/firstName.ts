/**
 * First name field detection patterns.
 *
 * Exports a FieldPatternRule for first/given name inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'firstName',
  patterns: [
    /first_?name/i,
    /fname/i,
    /given_?name/i,
    /given-?name/i,
    /first/i,
    /name-?first/i,
    /forename/i,
  ],
  description: 'First name',
};