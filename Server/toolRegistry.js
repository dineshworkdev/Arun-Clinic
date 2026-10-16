/**
 * Tool Registry Adapter (Legacy Adapter)
 * Exports the generic ToolRegistry class and a default configured instance for the dental demo.
 */

import { ToolRegistry } from './core/ToolRegistry.js';
import { createCheckAvailabilityTool } from './core/tools/checkAvailability.js';
import { dentalConfig } from './businesses/dental/config.js';

export { ToolRegistry };

// Global Singleton Instance for Dental Clinic Demo
export const toolRegistry = new ToolRegistry();
toolRegistry.register(createCheckAvailabilityTool(dentalConfig));

export default toolRegistry;
