import type { IProfile, IProfileData, IFormatMemory, IWatchtowerLists, IUnusedBacklinks } from '../types/storage';
import type { ProfileSummary } from '../types/profile';

/**
 * Default empty profile data (all fields empty strings).
 */
export const DEFAULT_PROFILE_DATA: IProfileData = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  website: '',
  company: '',
  title: '',
  phone: '',
  address: '',
  city: '',
  zip: '',
  region: '',
  country: '',
  category: '',
  masterHTML: '',
  isCatLocked: false,
};

/**
 * Template for creating a new profile (without id, timestamps).
 */
export const DEFAULT_PROFILE_TEMPLATE: Omit<IProfile, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'New Profile',
  data: DEFAULT_PROFILE_DATA,
};

/**
 * Default empty format memory.
 */
export const DEFAULT_FORMAT_MEMORY: IFormatMemory = {};

/**
 * Default empty watchtower lists.
 */
export const DEFAULT_WATCHTOWER_LISTS: IWatchtowerLists = {
  primary: [],
  secondary: [],
  pasted: [],
};

/**
 * Default empty unused backlinks.
 */
export const DEFAULT_UNUSED_BACKLINKS: IUnusedBacklinks = {
  categorized: {},
  history: [],
};

/**
 * Default profile summary (used when no profiles exist).
 */
export const DEFAULT_PROFILE_SUMMARY: ProfileSummary = {
  id: '',
  name: 'No Profile',
  createdAt: 0,
  updatedAt: 0,
};