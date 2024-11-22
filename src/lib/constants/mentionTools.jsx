import PropTypes from 'prop-types';

// @mentionFunctions
import { AI_TOOL_CONFIG } from '@/config/ai/agent';

import { analyzeUserSentiment } from './mentionFunctions/analyzeUserSentiment';
import { brightDataWebScraper } from './mentionFunctions/brightDataWebScraper';
import { falAiStableDiffusion3Medium } from './mentionFunctions/falAiStableDiffusion3Medium';
import { generateRecommendations } from './mentionFunctions/generateRecommendations';
import { getDeviceContext } from './mentionFunctions/getDeviceContext';
import { performDataAnalysis } from './mentionFunctions/performDataAnalysis';
import { portKeyAIGateway } from './mentionFunctions/portKeyAIGateway';
import { portKeyAIGatewayTogetherAI } from './mentionFunctions/portKeyAIGatewayTogetherAI';
import { searchKnowledgeBase } from './mentionFunctions/searchKnowledgeBase';
import { streamChatCompletion } from './mentionFunctions/streamChatCompletion';

export const reactAgentTools = {
  analyzeUserSentiment,
  getDeviceContext,
  searchKnowledgeBase,
  generateRecommendations,
  performDataAnalysis,
};

export const mentionFunctions = {
  ...reactAgentTools,
  streamChatCompletion,
  portKeyAIGateway,
  portKeyAIGatewayTogetherAI,
  falAiStableDiffusion3Medium,
  brightDataWebScraper,
};

export async function lookupTool(mentionTool, userMessage, streamable, file) {
  const toolInfo = AI_TOOL_CONFIG.mentionTools.find(
    tool => tool.id === mentionTool
  );
  if (toolInfo) {
    if (file) {
      const decodedFile = await Buffer.from(file, 'base64')
        .toString('utf-8')
        .replace(/^data:image\/\w+;base64,/, '');
      await mentionFunctions[toolInfo.functionName](
        mentionTool,
        userMessage + 'File Content: ' + decodedFile,
        streamable
      );
    } else {
      await mentionFunctions[toolInfo.functionName](
        mentionTool,
        userMessage,
        streamable
      );
    }
  }
}

lookupTool.propTypes = {
  mentionTool: PropTypes.string.isRequired,
  userMessage: PropTypes.string.isRequired,
  streamable: PropTypes.any.isRequired,
  file: PropTypes.string,
};

export default lookupTool;
