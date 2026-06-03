/**
 * Recognized field types for form filling.
 *
 * This is a pure type definition – no runtime code.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

export type FieldType =
  | 'username'
  | 'email'
  | 'secondaryEmail'
  | 'password'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'phone'
  | 'fax'
  | 'address'
  | 'city'
  | 'state'
  | 'zip'
  | 'country'
  | 'company'
  | 'website'
  | 'title'
  | 'subject'
  | 'category'
  | 'dob'
  | 'gender'
  | 'language'
  | 'timezone'
  | 'price'
  | 'social'
  | 'companySize'
  | 'billing'
  | 'shipping'
  | 'unknown';