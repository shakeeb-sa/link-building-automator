/**
 * Storage Schema Version
 * Increment when making breaking changes to storage structure.
 */
export type StorageVersion = 2;

/**
 * Supported format types for the right‑click paste menu.
 */
export type FormatType =
  | 'HTML Code (Clean)'
  | 'Plain Text'
  | 'Raw Text'
  | 'Markdown (Inline)'
  | 'BBCode'
  | 'Markdown (Reference)'
  | 'Rich Text';

/**
 * Individual profile data – the actual form field values.
 */
export interface IProfileData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  website: string;
  company: string;
  title: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  region: string;
  country: string;
  category: string;
  masterHTML: string;
  isCatLocked?: boolean;
}

/**
 * A saved profile.
 */
export interface IProfile {
  id: string;           // UUID
  name: string;         // Display name
  data: IProfileData;
  createdAt: number;    // timestamp
  updatedAt: number;    // timestamp
}

/**
 * Watchtower domain lists.
 */
export interface IWatchtowerLists {
  primary: string[];    // from primary Excel upload
  secondary: string[];  // from secondary Excel upload
  pasted: string[];     // from pasted URLs textarea
}

/**
 * Per‑domain remembered format.
 * Key: normalized domain (e.g., 'example.com')
 * Value: the chosen FormatType
 */
export interface IFormatMemory {
  [domain: string]: FormatType;
}

/**
 * Categorized backlinks (sheet name → array of URLs).
 */
export interface IUnusedBacklinksCategorized {
  [sheetName: string]: string[];
}

/**
 * Unused backlinks storage.
 */
export interface IUnusedBacklinks {
  categorized: IUnusedBacklinksCategorized;
  history: string[];    // URLs already processed
}

/**
 * Top‑level storage schema.
 * This is the actual object stored in chrome.storage.local.
 */
export interface IStorageSchema {
  version: StorageVersion;
  profiles: Record<string, IProfile>;  // id → profile
  activeProfileId: string | null;
  watchtower: IWatchtowerLists;
  formatMemory: IFormatMemory;
  unusedBacklinks: IUnusedBacklinks;
  goldMineEnabled: boolean;
  goldMineHistory: string[];           // domains already cycled
  masterSwitchEnabled: boolean;        // global LLB on/off
}

/**
 * Storage area keys (used in chrome.storage).
 * We store everything under a single key to avoid fragmentation.
 */
export const STORAGE_KEY = 'lightning_linkbuilder_store';

/**
 * Default empty storage state (used on first install).
 */
export const DEFAULT_STORAGE: IStorageSchema = {
  version: 2,
  profiles: {},
  activeProfileId: null,
  watchtower: {
    primary: [],
    secondary: [],
    pasted: [],
  },
  formatMemory: {},
  unusedBacklinks: {
    categorized: {},
    history: [],
  },
  goldMineEnabled: false,
  goldMineHistory: [],
  masterSwitchEnabled: true,
};