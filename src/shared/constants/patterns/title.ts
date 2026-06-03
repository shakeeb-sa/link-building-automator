/**
 * Job title / position field detection patterns.
 *
 * Exports a FieldPatternRule for job title, position, headline, and designation inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'title',
  patterns: [
    /^title$/i,
    /job_?title/i,
    /position/i,
    /headline/i,
    /professional-?title/i,
    /designation/i,
  ],
  description: 'Job title or headline',
};