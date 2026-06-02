
/**
 * Toggle message types for the extension's messaging system.
 *
 * Defines all messages related to feature toggles and activation commands:
 * - Master power switch (global enable/disable)
 * - Gold Mine shuffle (get random batch of saved formats)
 * - Toggle Gold Mine feature on/off
 * - QUAD_FILL command (keyboard shortcut / gesture for form filling)
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { BaseMessage } from './base';
import type { FormatType } from '../storage';

// ----------------------------------------------------------------------------
// MASTER_SWITCH_TOGGLE – enable/disable all extension features
// ----------------------------------------------------------------------------
export type MasterSwitchToggleMessage = BaseMessage<'MASTER_SWITCH_TOGGLE'> & {
  payload: { enabled: boolean };
};
export type MasterSwitchToggleResponse = { success: boolean };

// ----------------------------------------------------------------------------
// GOLD_MINE_SHUFFLE – request a random batch of domains with their saved formats
// ----------------------------------------------------------------------------
export type GoldMineShuffleMessage = BaseMessage<'GOLD_MINE_SHUFFLE'>;
export type GoldMineShuffleResponse = {
  batch: {
    urls: string[];
    formats: FormatType[];
  };
};

// ----------------------------------------------------------------------------
// TOGGLE_GOLD_MINE – enable/disable the Gold Mine floating button
// ----------------------------------------------------------------------------
export type ToggleGoldMineMessage = BaseMessage<'TOGGLE_GOLD_MINE'> & {
  payload: { enabled: boolean };
};
export type ToggleGoldMineResponse = { success: boolean };

// ----------------------------------------------------------------------------
// QUAD_FILL – trigger form filling (keyboard shortcut or quad-click gesture)
// ----------------------------------------------------------------------------
export type QuadFillMessage = BaseMessage<'QUAD_FILL'>;
export type QuadFillResponse = { success: boolean };