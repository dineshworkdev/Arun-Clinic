/**
 * Secure Chat API Client
 * Sends messages to the Express backend (/api/chat).
 * No API keys or secrets are exposed in the client.
 */

export async function sendChatMessage(message, conversationHistory = []) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message,
      provider: data.provider,
    };
  } catch (err) {
    console.warn('[AI Receptionist Network Notice]:', err.message);
    return {
      success: false,
      error: err.message,
      message: "I apologize, but I am having trouble connecting to the clinic concierge server right now. Please verify your connection or call our clinic directly at +91 98765 43210.",
    };
  }
}
