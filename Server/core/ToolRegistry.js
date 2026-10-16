/**
 * Generic Tool Registry
 * Manages tool registration, schema exportation (OpenAI, Gemini), and safe execution.
 * Completely reusable across any business or channel.
 */

export class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  /**
   * Register a tool definition
   */
  register(tool) {
    if (!tool || !tool.name || typeof tool.name !== 'string') {
      throw new Error('Tool must have a valid name string');
    }
    if (typeof tool.execute !== 'function') {
      throw new Error(`Tool "${tool.name}" must have an execute function`);
    }
    this.tools.set(tool.name, tool);
  }

  /**
   * Lookup registered tool
   */
  get(name) {
    return this.tools.get(name);
  }

  /**
   * Check if tool exists
   */
  has(name) {
    return this.tools.has(name);
  }

  /**
   * Safely execute a registered tool with execution context
   */
  async execute(name, args = {}, context = {}) {
    const tool = this.tools.get(name);
    if (!tool) {
      console.warn(`[ToolRegistry Security Warning]: Attempted execution of unregistered tool "${name}".`);
      return {
        available: false,
        error: 'TOOL_NOT_FOUND',
        message: `Tool "${name}" is not recognized or permitted.`,
      };
    }

    try {
      console.log(`[ToolRegistry Execution]: Invoking tool "${name}" with arguments:`, args);
      const result = await tool.execute(args, context);
      console.log(`[ToolRegistry Result]: Tool "${name}" returned:`, result);
      return result;
    } catch (err) {
      console.error(`[ToolRegistry Error]: Tool "${name}" threw an unexpected exception:`, err);
      return {
        available: false,
        error: 'TOOL_EXECUTION_ERROR',
        message: `An unexpected error occurred while executing ${name}: ${err.message}`,
      };
    }
  }

  /**
   * Get list of all registered tools formatted for OpenAI
   */
  getOpenAITools() {
    const openAITools = [];
    for (const tool of this.tools.values()) {
      openAITools.push({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      });
    }
    return openAITools;
  }

  /**
   * Get list of all registered tools formatted for Google Gemini
   */
  getGeminiFunctionDeclarations() {
    const declarations = [];
    for (const tool of this.tools.values()) {
      declarations.push({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      });
    }
    return declarations;
  }
}

export default ToolRegistry;
