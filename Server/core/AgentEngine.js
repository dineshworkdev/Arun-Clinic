/**
 * Reusable AI Receptionist Agent Engine
 * Core execution engine handling LLM interactions (Gemini, OpenAI),
 * tool invocation loop, conversation history, and local grounded decision pipeline.
 * Completely decoupled from specific business domain logic.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { buildSystemPrompt } from './promptBuilder.js';
import { resolveRelativeDate } from './tools/dateResolver.js';

export class AgentEngine {
  constructor({ businessConfig, toolRegistry, options = {} }) {
    if (!businessConfig) {
      throw new Error('[AgentEngine]: businessConfig is required to initialize the agent.');
    }
    if (!toolRegistry) {
      throw new Error('[AgentEngine]: toolRegistry is required to initialize the agent.');
    }

    this.businessConfig = businessConfig;
    this.toolRegistry = toolRegistry;
    this.options = options;

    this.geminiClient = null;
    this.openaiClient = null;
  }

  getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;
    if (!this.geminiClient) {
      this.geminiClient = new GoogleGenerativeAI(apiKey);
    }
    return this.geminiClient;
  }

  getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') return null;
    if (!this.openaiClient) {
      this.openaiClient = new OpenAI({ apiKey });
    }
    return this.openaiClient;
  }

  /**
   * Helper to detect availability checking intent from user input
   */
  detectAvailabilityIntent(userMessage) {
    const lower = userMessage.toLowerCase();
    const staffList = this.businessConfig.business?.staff || this.businessConfig.doctors || [];

    const isAvailabilityQuery =
      lower.includes('available') ||
      lower.includes('see dr') ||
      lower.includes('see doctor') ||
      lower.includes('can i see') ||
      lower.includes('slot') ||
      lower.includes('free') ||
      lower.includes('appointment at') ||
      lower.includes('appointment on') ||
      lower.includes('consultation on') ||
      lower.includes('booking for') ||
      lower.includes('schedule with') ||
      (lower.includes('appointment') && (lower.includes('am') || lower.includes('pm') || lower.includes(':')));

    if (!isAvailabilityQuery) {
      return null;
    }

    // 1. Detect Staff Member from config
    let matchedStaff = staffList[0]?.name || 'Specialist';
    let staffFound = false;

    for (const member of staffList) {
      const cleanName = member.name.replace(/^(dr\.?|doctor|mr\.?|ms\.?|mrs\.?)\s+/i, '').toLowerCase();
      const parts = cleanName.split(/\s+/).filter((p) => p.length >= 3);
      for (const part of parts) {
        if (lower.includes(part)) {
          matchedStaff = member.name;
          staffFound = true;
          break;
        }
      }
      if (staffFound) break;
    }

    if (!staffFound) {
      // Check if an external or unknown title was mentioned (e.g. Dr. Henderson, Doctor Jones)
      const titleMatch = userMessage.match(/(?:dr\.?|doctor|mr\.?|ms\.?)\s+([A-Za-z]+)/i);
      if (titleMatch) {
        matchedStaff = `Dr. ${titleMatch[1]}`;
      }
    }

    // 2. Detect Target Date
    let dateRaw = 'tomorrow';
    if (lower.includes('today')) {
      dateRaw = 'today';
    } else if (lower.includes('tomorrow')) {
      dateRaw = 'tomorrow';
    } else if (lower.includes('day after tomorrow')) {
      dateRaw = 'day after tomorrow';
    } else {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const matchedDay = days.find((d) => lower.includes(d));
      if (matchedDay) {
        dateRaw = matchedDay;
      } else {
        const isoMatch = userMessage.match(/\b\d{4}-\d{2}-\d{2}\b/);
        if (isoMatch) {
          dateRaw = isoMatch[0];
        }
      }
    }
    const resolvedDate = resolveRelativeDate(dateRaw);

    // 3. Detect Preferred Time
    let time = '10:30 AM';
    const timeMatch =
      userMessage.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i) ||
      userMessage.match(/at\s+(\d{1,2})\b/i);

    if (timeMatch) {
      let t = timeMatch[1].trim();
      if (/^\d{1,2}$/.test(t)) {
        const h = parseInt(t, 10);
        t = h >= 8 && h <= 11 ? `${h}:00 AM` : `${h}:00 PM`;
      }
      time = t;
    }

    return {
      staffMember: matchedStaff,
      doctor: matchedStaff, // Backwards-compatible alias
      date: resolvedDate,
      time,
    };
  }

  /**
   * Synthesize natural language reply from tool execution result
   */
  synthesizeResponseFromToolResult(toolResult) {
    const phone = this.businessConfig.business?.contact?.phone || this.businessConfig.clinic?.phone || '';
    const staffName = toolResult.staffMember || toolResult.doctor || 'The specialist';

    if (toolResult.error === 'UNKNOWN_DOCTOR') {
      return `${toolResult.message} Would you like to check availability with one of our resident specialists instead?`;
    }

    if (toolResult.error === 'TOOL_EXECUTION_ERROR' || toolResult.error === 'TOOL_NOT_FOUND') {
      return `I apologize, but I could not verify schedule availability at this moment due to a technical error. Please reach out to our concierge desk directly at ${phone}.`;
    }

    if (toolResult.available) {
      return `Yes, ${staffName} is available on ${toolResult.date} at ${toolResult.time}. Would you like me to submit an appointment request for this slot?`;
    }

    // Unavailable / booked
    return `${toolResult.message} Would you like to check a different date or time slot?`;
  }

  /**
   * Dynamic Grounded fallback generator when no external LLM is configured
   */
  getGroundedFallbackResponse(userMessage) {
    const q = userMessage.toLowerCase();
    const b = this.businessConfig.business || {};
    const contact = b.contact || this.businessConfig.clinic || {};
    const staffList = b.staff || this.businessConfig.doctors || [];
    const location = b.location || this.businessConfig.clinic || {};
    const emergencyPhone = contact.emergencyPhone || contact.phone;

    // 1. Medical safety & non-diagnosis directive
    if (
      q.includes('hurt') ||
      q.includes('pain') ||
      q.includes('ache') ||
      q.includes('bleed') ||
      q.includes('swollen') ||
      q.includes('infection') ||
      q.includes('medicine') ||
      q.includes('prescribe') ||
      q.includes('diagnos')
    ) {
      const staffNames = staffList.map((s) => s.name).join(', ');
      return (
        "I am an AI receptionist and cannot provide medical or dental diagnoses, nor can I prescribe medication. " +
        `If you are experiencing pain, swelling, or discomfort, I strongly recommend scheduling a clinical examination with one of our specialists ` +
        `(${staffNames}). If this is an urgent emergency with severe swelling or bleeding, please call our 24/7 emergency line immediately at ` +
        emergencyPhone + "."
      );
    }

    // 2. Services query
    if (
      q.includes('service') ||
      q.includes('treatment') ||
      q.includes('procedure') ||
      q.includes('cleaning') ||
      q.includes('implant') ||
      q.includes('whitening') ||
      q.includes('invisalign') ||
      q.includes('veneer') ||
      q.includes('root canal')
    ) {
      const services = b.services || this.businessConfig.services || [];
      const serviceLines = services
        .map((cat) => {
          const names = (cat.items || []).map((i) => i.name).join(', ');
          return `• ${cat.category}: ${names}.`;
        })
        .join('\n');

      return (
        `${b.name || 'Our clinic'} offers comprehensive digital dental care across five main departments:\n` +
        `${serviceLines}\n\n` +
        `Would you like to request an appointment for any of these treatments?`
      );
    }

    // 3. Operating hours query
    if (
      q.includes('hour') ||
      q.includes('time') ||
      q.includes('open') ||
      q.includes('close') ||
      q.includes('timing') ||
      q.includes('saturday') ||
      q.includes('sunday')
    ) {
      const hours = b.operatingHours || this.businessConfig.operatingHours || {};
      return (
        `Our standard clinic hours are:\n` +
        `• ${hours.schedule || 'Monday to Friday: 8:00 AM – 6:00 PM'}\n` +
        `• ${hours.weekend || 'Saturday & Sunday: Closed for routine appointments'}\n\n` +
        `For urgent dental emergencies outside these hours, our on-call surgical team is reachable 24/7 at ${emergencyPhone}.`
      );
    }

    // 4. Location / address query
    if (
      q.includes('location') ||
      q.includes('where') ||
      q.includes('address') ||
      q.includes('direction') ||
      q.includes('reach') ||
      q.includes('place')
    ) {
      return (
        `We are located at:\n${location.address}\n` +
        `Landmark: ${location.landmark}.\n` +
        `Valet parking is available on-site for all clinic guests.`
      );
    }

    // 5. Staff / specialists query
    if (q.includes('doctor') || q.includes('specialist') || q.includes('team') || q.includes('dentist') || q.includes('staff')) {
      const staffLines = staffList
        .map((s) => `• ${s.name} – ${s.title || s.role} (${s.experience}; ${s.specialties?.slice(0, 3).join(', ')}. Available ${s.availabilityDays})`)
        .join('\n');

      return (
        `Our clinical team is led by three renowned specialists:\n` +
        `${staffLines}\n\n` +
        `You can request a consultation with any of our specialists directly here in the chat.`
      );
    }

    // 6. Appointment request query (without specific slot check)
    if (q.includes('book') || q.includes('appointment') || q.includes('schedule') || q.includes('consultation')) {
      return (
        `You can request an appointment directly through this chat by clicking "Book an Appointment", or by calling our concierge at ${contact.phone}.\n\n` +
        `Please note that online submissions are provisional requests. Our concierge team will contact you within 2 business hours via phone or WhatsApp to confirm your preferred date and slot.`
      );
    }

    // 7. Default greeting
    return (
      `Welcome to ${b.name || 'our concierge'}. I am the digital receptionist. ` +
      `I can help you check doctor availability, explain our services, provide clinic hours, or assist you with scheduling an appointment. ` +
      `How may I assist you today?`
    );
  }

  /**
   * Main conversation processor: processes user message and returns response
   */
  async processMessage(userMessage, conversationHistory = []) {
    const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
    const gemini = this.getGeminiClient();
    const openai = this.getOpenAIClient();
    const systemPrompt = buildSystemPrompt(this.businessConfig);
    const executionContext = { businessConfig: this.businessConfig };

    // 1. Google Gemini Provider with Function Calling
    if ((provider === 'gemini' || !openai) && gemini) {
      try {
        const modelName = process.env.AI_MODEL || 'gemini-1.5-flash';
        const tools = [{
          functionDeclarations: this.toolRegistry.getGeminiFunctionDeclarations(),
        }];

        const model = gemini.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          tools,
        });

        const contents = [];
        const recentHistory = conversationHistory.slice(-8);

        for (const msg of recentHistory) {
          if (!msg.content || !msg.content.trim()) continue;
          const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
          contents.push({
            role,
            parts: [{ text: msg.content.trim() }],
          });
        }

        contents.push({
          role: 'user',
          parts: [{ text: userMessage.trim() }],
        });

        const initialResult = await model.generateContent({ contents });
        const initialResponse = initialResult.response;

        // Check if model called a function/tool
        const functionCalls = initialResponse.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
          const call = functionCalls[0];
          console.log(`[Gemini Tool Decision]: Model invoked tool "${call.name}" with args:`, call.args);

          // Execute tool securely in registry with business context
          const toolResult = await this.toolRegistry.execute(call.name, call.args, executionContext);

          // Send function response back to Gemini to generate final natural response
          contents.push(initialResponse.candidates[0].content);
          contents.push({
            role: 'function',
            parts: [{
              functionResponse: {
                name: call.name,
                response: toolResult,
              },
            }],
          });

          const followUpResult = await model.generateContent({ contents });
          const finalText = followUpResult.response.text();

          return {
            message: finalText.trim(),
            provider: `gemini (${modelName})`,
            toolCall: {
              name: call.name,
              args: call.args,
              result: toolResult,
            },
          };
        }

        // No function call was made, return standard text
        const text = initialResponse.text();
        if (text && text.trim()) {
          return {
            message: text.trim(),
            provider: `gemini (${modelName})`,
          };
        }
      } catch (err) {
        console.error('[Gemini API Error with Tools]:', err.message);
      }
    }

    // 2. OpenAI Provider with Function Calling
    if (openai) {
      try {
        const modelName = process.env.AI_MODEL || 'gpt-4o-mini';
        const openAITools = this.toolRegistry.getOpenAITools();

        const messages = [
          { role: 'system', content: systemPrompt },
        ];

        const recentHistory = conversationHistory.slice(-8);
        for (const msg of recentHistory) {
          if (!msg.content || !msg.content.trim()) continue;
          const role = msg.role === 'assistant' ? 'assistant' : 'user';
          messages.push({ role, content: msg.content.trim() });
        }

        messages.push({ role: 'user', content: userMessage.trim() });

        const initialCompletion = await openai.chat.completions.create({
          model: modelName,
          messages,
          tools: openAITools,
          tool_choice: 'auto',
          temperature: 0.2,
        });

        const choice = initialCompletion.choices[0];
        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
          const toolCall = choice.message.tool_calls[0];
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments || '{}');
          console.log(`[OpenAI Tool Decision]: Model invoked tool "${toolName}" with args:`, toolArgs);

          const toolResult = await this.toolRegistry.execute(toolName, toolArgs, executionContext);

          messages.push(choice.message);
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });

          const finalCompletion = await openai.chat.completions.create({
            model: modelName,
            messages,
            temperature: 0.2,
          });

          return {
            message: finalCompletion.choices[0].message.content.trim(),
            provider: `openai (${modelName})`,
            toolCall: {
              name: toolName,
              args: toolArgs,
              result: toolResult,
            },
          };
        }

        // No tool called
        return {
          message: choice.message.content.trim(),
          provider: `openai (${modelName})`,
        };
      } catch (err) {
        console.error('[OpenAI API Error with Tools]:', err.message);
      }
    }

    // 3. Reusable AI Agent Engine (Local Grounded Decision & Execution Pipeline)
    const availabilityParams = this.detectAvailabilityIntent(userMessage);

    if (availabilityParams) {
      console.log('[Local Agent Tool Decision]: Model decided to call "check_availability" with:', availabilityParams);
      const toolResult = await this.toolRegistry.execute('check_availability', availabilityParams, executionContext);
      const synthesizedResponse = this.synthesizeResponseFromToolResult(toolResult);

      return {
        message: synthesizedResponse,
        provider: 'reusable-agent-engine',
        toolCall: {
          name: 'check_availability',
          args: availabilityParams,
          result: toolResult,
        },
      };
    }

    // Standard knowledge lookup without tool call
    return {
      message: this.getGroundedFallbackResponse(userMessage),
      provider: 'reusable-agent-engine',
    };
  }
}

export default AgentEngine;
