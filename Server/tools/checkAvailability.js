/**
 * Legacy Adapter: checkAvailability
 * Re-exports the configured checkAvailabilityTool and factory from the Agent Core.
 */

import { createCheckAvailabilityTool } from '../core/tools/checkAvailability.js';
import { dentalConfig } from '../businesses/dental/config.js';

export const checkAvailabilityTool = createCheckAvailabilityTool(dentalConfig);
export { createCheckAvailabilityTool };
export default checkAvailabilityTool;
