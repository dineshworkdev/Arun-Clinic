/**
 * AI Service Facade (Dental Clinic Demo Channel Adapter)
 * Delegates request processing to the reusable AI Receptionist Agent Engine
 * configured with the Dental Clinic business profile.
 */

import { dentalAgent, dentalConfig } from './businesses/dental/index.js';

export { dentalAgent, dentalConfig };

/**
 * Generate AI response for the Dental Clinic demo channel
 */
export async function generateAIResponse(userMessage, conversationHistory = []) {
  return dentalAgent.processMessage(userMessage, conversationHistory);
}

export default generateAIResponse;
