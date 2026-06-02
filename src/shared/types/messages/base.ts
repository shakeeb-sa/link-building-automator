/**
 * Base message types for the extension's messaging system.
 *
 * This file defines the core `BaseMessage<T>` interface and the central
 * `MessageType` union containing all possible message type strings.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

// ----------------------------------------------------------------------------
// Base message shape – all messages must have a `type` field.
// ----------------------------------------------------------------------------
export interface BaseMessage<T extends string> {
  type: T;
}

// ----------------------------------------------------------------------------
// Central union of all message type strings.
// These are used to restrict which types can appear in `ExtensionMessage`.
// ----------------------------------------------------------------------------
export type MessageType =
  // Profile messages
  | 'GET_ACTIVE_PROFILE'
  | 'GET_PROFILE_DATA'
  | 'SET_ACTIVE_PROFILE'
  | 'UPDATE_PROFILE_DATA'
  | 'GET_ALL_PROFILES'
  | 'CREATE_PROFILE'
  | 'UPDATE_PROFILE'
  | 'DELETE_PROFILE'

  // Watchtower messages
  | 'GET_WATCHTOWER_STATUS'
  | 'GET_WATCHTOWER_LISTS'
  | 'UPDATE_WATCHTOWER_LISTS'
  | 'ADD_PRIMARY_DOMAINS'
  | 'ADD_SECONDARY_DOMAINS'
  | 'SET_PASTED_DOMAINS'
  | 'CLEAR_PRIMARY_DOMAINS'
  | 'CLEAR_SECONDARY_DOMAINS'
  | 'CLEAR_PASTED_DOMAINS'

  // Format Memory messages
  | 'GET_FORMAT_MEMORY'
  | 'SET_FORMAT_MEMORY'
  | 'GET_ALL_FORMATS'
  | 'DELETE_FORMAT'
  | 'CLEAR_ALL_FORMATS'

  // Unused Backlinks messages
  | 'GET_UNUSED_BACKLINKS'
  | 'SHUFFLE_BACKLINKS'

  // Navigation & overlay messages
  | 'OPEN_GATEWAY_MENU'
  | 'ACTIVATE_FAKEMAIL'
  | 'ACTIVATE_CONVERTER'

  // Toggle messages
  | 'MASTER_SWITCH_TOGGLE'
  | 'GOLD_MINE_SHUFFLE'
  | 'TOGGLE_GOLD_MINE'

  // UI feedback messages
  | 'SHOW_TOAST'
  | 'CONTEXT_MENU_PASTE'

  // Additional – add QUAD_FILL if needed, but keep consistent with original
  // (The original did not have QUAD_FILL yet, but we can add it later)
  | 'QUAD_FILL';