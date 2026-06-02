/**
 * Navigation message types for the extension's messaging system.
 *
 * Defines all messages related to opening external tools and overlays:
 * - Opening the Gateway Hunter menu at specific coordinates
 * - Activating the FakeMail tab
 * - Activating the Link Converter tab (with ping‑pong return support)
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { BaseMessage } from './base';

// ----------------------------------------------------------------------------
// OPEN_GATEWAY_MENU – display the gateway hunter menu at (x, y)
// ----------------------------------------------------------------------------
export type OpenGatewayMenuMessage = BaseMessage<'OPEN_GATEWAY_MENU'> & {
  payload: { x: number; y: number };
};
export type OpenGatewayMenuResponse = { success: boolean };

// ----------------------------------------------------------------------------
// ACTIVATE_FAKEMAIL – open or refresh fakemail.net
// ----------------------------------------------------------------------------
export type ActivateFakeMailMessage = BaseMessage<'ACTIVATE_FAKEMAIL'>;
export type ActivateFakeMailResponse = { success: boolean };

// ----------------------------------------------------------------------------
// ACTIVATE_CONVERTER – open the link converter tab, optionally store return tab
// ----------------------------------------------------------------------------
export type ActivateConverterMessage = BaseMessage<'ACTIVATE_CONVERTER'> & {
  payload: { returnTabId?: number };
};
export type ActivateConverterResponse = { success: boolean };