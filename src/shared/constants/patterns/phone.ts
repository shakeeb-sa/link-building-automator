/**
 * Phone / mobile number field detection patterns.
 *
 * Exports a FieldPatternRule for phone, mobile, and contact number inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'phone',
  patterns: [
    /phone/i,
    /mobile/i,
    /cell/i,
    /telephone/i,
    /tel/i,
    /cell-?phone/i,
    /mobile-?number/i,
    /phone-?number/i,
    /contact-?number/i,
    /tel-?number/i,
    /telephone-?number/i,
    /home-?phone/i,
    /work-?phone/i,
    /daytime-?phone/i,
    /evening-?phone/i,
  ],
  description: 'Phone/mobile',
};