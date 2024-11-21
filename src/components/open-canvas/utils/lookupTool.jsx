import { AI_TOOL_CONFIG } from '@/lib/constants/functions';

export async function lookupTool(name, args) {
  try {
    // Get tool configuration
    const toolInfo = AI_TOOL_CONFIG.tools.find(tool => tool.name === name);
    if (!toolInfo) {
      throw new Error(`Tool ${name} not found in configuration`);
    }

    // Get tool implementation
    const toolImplementation = await import(`@/lib/constants/functions-library/${toolInfo.path}`);
    if (!toolImplementation || !toolImplementation.default) {
      throw new Error(`Implementation for tool ${name} not found`);
    }

    // Execute tool
    const result = await toolImplementation.default(args);
    
    // Format result for assistant
    return {
      type: 'tool_result',
      tool: name,
      output: result
    };

  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    return {
      type: 'tool_error',
      tool: name,
      error: error.message
    };
  }
}

export async function validateToolArgs(name, args) {
  const toolInfo = AI_TOOL_CONFIG.tools.find(tool => tool.name === name);
  if (!toolInfo) {
    throw new Error(`Tool ${name} not found`);
  }

  // Validate required arguments
  const missingArgs = toolInfo.required_args?.filter(arg => !(arg in args));
  if (missingArgs?.length) {
    throw new Error(`Missing required arguments for ${name}: ${missingArgs.join(', ')}`);
  }

  return true;
}

export default lookupTool;
