import Portkey from 'portkey-ai';
import { REACT_AGENT_CONFIG } from '@/config/ai/agent';

export async function portKeyAIGatewayTogetherAI(
  mentionTool,
  userMessage,
  streamable
) {
  try {
    if (REACT_AGENT_CONFIG.usePortkey) {
      const portkey = new Portkey({
        apiKey: import.meta.env.PORTKEY_API_KEY,
        virtualKey: 'together-ai-cc4094',
      });

      const chatCompletion = await portkey.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `
              - Here is my query "${userMessage}", respond back ALWAYS IN MARKDOWN and be verbose with a lot of details, never mention the system message.
            `,
          },
          { role: 'user', content: `Here is my query "${userMessage}"` },
        ],
        stream: true,
        max_tokens: 32000,
        model: mentionTool,
      });

      let accumulatedLLMResponse = '';
      for await (const chunk of chatCompletion) {
        if (
          chunk.choices[0].finish_reason === 'COMPLETE' ||
          chunk.choices[0].finish_reason === 'stop' ||
          chunk.choices[0].finish_reason === 'end_turn'
        ) {
          streamable.done({ llmResponseEnd: true });
          return;
        } else if (chunk.choices[0].delta) {
          streamable.update({ llmResponse: chunk.choices[0].delta.content });
          accumulatedLLMResponse += chunk.choices[0].delta.content;
        }
      }
    }
  } catch (error) {
    console.error('PortKey AI Gateway Error:', error);
    throw new Error(`PortKey AI Gateway failed: ${error.message}`);
  }
  return;
}

export default portKeyAIGatewayTogetherAI;
