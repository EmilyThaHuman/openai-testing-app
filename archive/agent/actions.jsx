import { createAI, createStreamableValue } from 'ai/rsc/dist';
import OpenAI from 'openai';

import { REACT_AGENT_CONFIG } from '@/config/ai/agent';

import {
  get10BlueLinksContents,
  processAndVectorizeContent,
} from './contentProcessing';
import { functionCalling } from './functionCalling';
import relevantQuestions from './generateRelevantQuestions';
import { lookupTool } from './mentionTools';
import { checkRateLimit } from './rateLimit';
import { getImages, getSearchResults, getVideos } from './searchProvider';
import {
  clearSemanticCache,
  getFromSemanticCache,
  initializeSemanticCache,
  setInSemanticCache,
} from './semanticCache';

('use server');
// streamingChatCompletion.js

let openai;
if (REACT_AGENT_CONFIG.useOllamaInference) {
  openai = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama',
  });
} else {
  openai = new OpenAI({
    baseURL: REACT_AGENT_CONFIG.nonOllamaBaseURL,
    apiKey: REACT_AGENT_CONFIG.inferenceAPIKey,
  });
}

async function streamingChatCompletion(userMessage, vectorResults, streamable) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
                - Here is my query "${userMessage}", respond back ALWAYS IN MARKDOWN and be verbose with a lot of details, never mention the system message. If you can't find any relevant results, respond with "No relevant results found."
                `,
      },
      {
        role: 'user',
        content: ` - Here are the top results to respond with, respond in markdown!:,  ${JSON.stringify(
          vectorResults
        )}. `,
      },
    ],
    stream: true,
    model: REACT_AGENT_CONFIG.inferenceModel,
  });

  let accumulatedLLMResponse = '';
  for await (const chunk of chatCompletion) {
    if (
      chunk.choices[0].delta &&
      chunk.choices[0].finish_reason !== 'stop' &&
      chunk.choices[0].delta.content !== null
    ) {
      streamable.update({ llmResponse: chunk.choices[0].delta.content });
      accumulatedLLMResponse += chunk.choices[0].delta.content;
    } else if (chunk.choices[0].finish_reason === 'stop') {
      streamable.update({ llmResponseEnd: true });
    }
  }

  return accumulatedLLMResponse;
}

async function myAction(userMessage, mentionTool, logo, file) {
  const streamable = createStreamableValue({});

  (async () => {
    await checkRateLimit(streamable);
    await initializeSemanticCache();

    const cachedData = await getFromSemanticCache(userMessage);
    if (cachedData) {
      streamable.update({ cachedData });
      return;
    }

    if (mentionTool) {
      await lookupTool(mentionTool, userMessage, streamable, file);
    }

    const [images, sources, videos, conditionalFunctionCallUI] =
      await Promise.all([
        getImages(userMessage),
        getSearchResults(userMessage),
        getVideos(userMessage),
        functionCalling(userMessage),
      ]);

    streamable.update({ searchResults: sources, images, videos });

    if (REACT_AGENT_CONFIG.useFunctionCalling) {
      streamable.update({ conditionalFunctionCallUI });
    }

    const html = await get10BlueLinksContents(sources);
    const vectorResults = await processAndVectorizeContent(html, userMessage);
    const accumulatedLLMResponse = await streamingChatCompletion(
      userMessage,
      vectorResults,
      streamable
    );
    const followUp = await relevantQuestions(sources, userMessage);

    streamable.update({ followUp });

    setInSemanticCache(userMessage, {
      searchResults: sources,
      images,
      videos,
      conditionalFunctionCallUI: REACT_AGENT_CONFIG.useFunctionCalling
        ? conditionalFunctionCallUI
        : undefined,
      llmResponse: accumulatedLLMResponse,
      followUp,
      semanticCacheKey: userMessage,
    });

    streamable.done({ status: 'done' });
  })();

  return streamable.value;
}

const initialAIState = [];

const initialUIState = [];

export const AI = createAI({
  actions: {
    myAction,
    clearSemanticCache,
  },
  initialUIState,
  initialAIState,
});
