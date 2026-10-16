/**
 * Dental Clinic Business Package
 * Provides dental business configuration and factory to create a configured AI Receptionist Agent instance.
 */

import { AgentEngine } from '../../core/AgentEngine.js';
import { ToolRegistry } from '../../core/ToolRegistry.js';
import { createCheckAvailabilityTool } from '../../core/tools/checkAvailability.js';
import { dentalConfig } from './config.js';

/**
 * Creates an AI Receptionist Agent instance specifically configured for Dental Clinic
 */
export function createDentalAgent() {
  const toolRegistry = new ToolRegistry();
  toolRegistry.register(createCheckAvailabilityTool(dentalConfig));

  return new AgentEngine({
    businessConfig: dentalConfig,
    toolRegistry,
  });
}

// Default dental agent instance
export const dentalAgent = createDentalAgent();

export { dentalConfig };
export default dentalAgent;
