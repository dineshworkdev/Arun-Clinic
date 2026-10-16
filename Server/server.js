import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateAIResponse } from './aiService.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasGemini = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  const hasOpenAI = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here');

  res.json({
    status: 'ok',
    service: 'Dental Clinic AI Receptionist Backend',
    activeProvider: hasGemini ? 'Google Gemini' : hasOpenAI ? 'OpenAI' : 'Grounded Knowledge Engine (Set API key in Server/.env to enable live LLM)',
    timestamp: new Date().toISOString(),
  });
});

// Main Chat API Endpoint: POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string.',
      });
    }

    const history = Array.isArray(conversationHistory) ? conversationHistory : [];

    // Call AI Service
    const aiResult = await generateAIResponse(message.trim(), history);

    return res.json({
      message: aiResult.message,
      provider: aiResult.provider,
      toolCall: aiResult.toolCall || null,
    });
  } catch (error) {
    console.error('[Server Error in /api/chat]:', error);
    return res.status(500).json({
      error: 'An error occurred while processing your request.',
      message: 'I apologize for the inconvenience. Our concierge system encountered a momentary disruption. Please try asking again or call our clinic directly at +91 98765 43210.',
    });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Dental Clinic AI Server] Running securely on http://localhost:${PORT}`);
  console.log(`[Health check] http://localhost:${PORT}/api/health`);
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    console.log('[Notice] No GEMINI_API_KEY or OPENAI_API_KEY found in Server/.env.');
    console.log('[Notice] Running with local Grounded Clinic Knowledge Engine.');
  }
});
