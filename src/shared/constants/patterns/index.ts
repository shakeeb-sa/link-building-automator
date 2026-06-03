/**
 * Central assembler for all field detection patterns.
 *
 * Imports each field‑specific pattern module and combines them into
 * the priority‑ordered FIELD_PATTERNS array.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

// Import all field pattern modules
import { patterns as password } from './password';
import { patterns as email } from './email';
import { patterns as secondaryEmail } from './secondaryEmail';
import { patterns as username } from './username';
import { patterns as firstName } from './firstName';
import { patterns as lastName } from './lastName';
import { patterns as fullName } from './fullName';
import { patterns as phone } from './phone';
import { patterns as fax } from './fax';
import { patterns as address } from './address';
import { patterns as city } from './city';
import { patterns as state } from './state';
import { patterns as zip } from './zip';
import { patterns as country } from './country';
import { patterns as company } from './company';
import { patterns as website } from './website';
import { patterns as title } from './title';
import { patterns as subject } from './subject';
import { patterns as category } from './category';
import { patterns as dob } from './dob';
import { patterns as gender } from './gender';
import { patterns as language } from './language';
import { patterns as timezone } from './timezone';
import { patterns as price } from './price';
import { patterns as social } from './social';
import { patterns as companySize } from './companySize';
import { patterns as billing } from './billing';
import { patterns as shipping } from './shipping';

// Re‑export types for convenience
export type { FieldPatternRule } from './types';

/**
 * Priority‑ordered field detection patterns.
 * Earlier rules have higher priority.
 */
export const FIELD_PATTERNS = [
  password,
  email,
  secondaryEmail,
  username,
  firstName,
  lastName,
  fullName,
  phone,
  fax,
  address,
  city,
  state,
  zip,
  country,
  company,
  website,
  title,
  subject,
  category,
  dob,
  gender,
  language,
  timezone,
  price,
  social,
  companySize,
  billing,
  shipping,
];