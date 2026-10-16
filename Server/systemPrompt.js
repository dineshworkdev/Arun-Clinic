/**
 * System Prompt Generator (Legacy Adapter)
 * Delegates prompt building to the core promptBuilder using the Dental Clinic business profile.
 */

import { buildSystemPrompt } from './core/promptBuilder.js';
import { dentalConfig } from './businesses/dental/config.js';

export function getSystemPrompt(serverTime = new Date()) {
  return buildSystemPrompt(dentalConfig, serverTime);
}

export default getSystemPrompt;
