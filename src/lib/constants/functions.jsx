import { ChatOpenAI } from "langchain/chat_models/openai";
import { SystemMessage, HumanMessage } from "langchain/schema";
import { PromptTemplate } from "langchain/prompts";
import { OpenAI } from "langchain/openai";
import axios from "axios";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";

const logger = console;

const logChatDataError = (functionName, chatData, error) => {
  logger.error(`Error in ${functionName}:`, error);
  logger.error(`Chat data:`, chatData);
};

const chatOpenAI = new ChatOpenAI({
  modelName: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
  openAIApiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
});

const perplexityConfig = {
  model: 'llama3-8b-8192',
  apiKey: import.meta.env.PERPLEXITY_API_KEY,
};



/**
 * Helper function to create chat completions.
 * @param {Array} messages - Array of message objects for the chat.
 * @param {number} maxTokens - Maximum tokens for the response.
 * @param {number} temperature - Temperature setting for the response.
 * @returns {Promise<string>} - The response from OpenAI.
 */
async function createChatCompletion(messages, maxTokens = 150, temperature = 0.7) {
  try {
    const chatModel = new ChatOpenAI({
      modelName: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
      temperature,
      maxTokens,
      openAIApiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
    });
    const response = await chatModel.call(messages);
    return response.content.trim();
  } catch (error) {
    logger.error(
      'Error in createChatCompletion:',
      error.response ? error.response.data : error.message
    );
    throw new Error('OpenAI API request failed.');
  }
}

/**
 * Extracts the main keywords from the provided text.
 * @param {string} text - The text to extract keywords from.
 * @returns {Promise<Array>} - An array of extracted keywords.
 */
async function extractKeywords(text) {
  const systemMessage = new SystemMessage(
    'You are a helpful assistant that extracts main keywords from given text.'
  );
  const humanMessage = new HumanMessage(
    `Extract the main keywords from the following text:\n\n${text}\n\nProvide the keywords as a comma-separated list.`
  );

  const response = await chatOpenAI.call([systemMessage, humanMessage]);
  logger.info(`Extracted keywords: ${response.content}`);
  return response.content.split(',').map(keyword => keyword.trim());
}

/**
 * Generates a concise chat title based on the first user prompt.
 * @param {string} firstPrompt - The user's first prompt.
 * @returns {Promise<string>} - The generated chat title.
 */
async function generateChatTitle(firstPrompt) {
  if (!import.meta.env.OPENAI_API_PROJECT_KEY) {
    throw new Error('OpenAI API key is not configured.');
  }

  const systemMessage = new SystemMessage(
    `Generate a concise and descriptive title for this chat session based on the user's first prompt. The title should be no more than five words and encapsulate the main topic or purpose of the conversation.

Examples:
- 'I need help planning my vacation to Italy.' becomes Vacation Planning GPT ✈️
- 'Can you assist me in understanding quantum physics?' becomes Quantum Physics GPT 🔬`
  );
  const humanMessage = new HumanMessage(firstPrompt);

  const response = await chatOpenAI.call([systemMessage, humanMessage]);
  return response.content.trim();
}

/**
 * Categorizes a user's query into predefined categories.
 * @param {string} userQuery - The user's query.
 * @returns {Promise<string>} - The category name.
 */
async function categorizeUserQuery(userQuery) {
  const systemMessage = new SystemMessage(
    `Categorize the user's query into one of the following categories:
- Technical Support
- Sales Inquiry
- General Information
- Feedback
- Other

Respond with only the category name.`
  );
  const humanMessage = new HumanMessage(userQuery);

  const response = await chatOpenAI.call([systemMessage, humanMessage]);
  return response.content.trim();
}

/**
 * Generates actionable items from a user's query.
 * @param {string} userQuery - The user's query.
 * @returns {Promise<Array>} - An array of action items.
 */
async function generateActionItems(userQuery) {
  const systemMessage = new SystemMessage(
    'Identify actionable steps or tasks from the following query. Respond with a numbered list.'
  );
  const humanMessage = new HumanMessage(`Query: "${userQuery}"`);

  const response = await chatOpenAI.call([systemMessage, humanMessage]);
  const actionItemsText = response.content;
  const actionItems = actionItemsText
    .split('\n')
    .map(item => item.replace(/^\d+\.\s*/, '').trim())
    .filter(item => item);
  return actionItems;
}

/**
 * Handles the summarization process for chat messages.
 * @param {Array} messages - The messages to summarize (last 5 messages).
 * @param {string} sessionId - The session ID.
 * @returns {Promise<object>} - The summarization result.
 */
async function summarizeMessages(messages, sessionId) {
  const summarizeFunction = {
    name: 'summarize_messages',
    description:
      'Summarize a list of chat messages with an overall summary and individual message summaries including their IDs.',
    parameters: {
      type: 'object',
      properties: {
        overallSummary: {
          type: 'string',
          description: 'An overall summary of the chat messages.',
        },
        individualSummaries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'The ID of the chat message.' },
              summary: { type: 'string', description: 'A summary of the individual chat message.' },
            },
            required: ['id', 'summary'],
          },
        },
      },
      required: ['overallSummary', 'individualSummaries'],
    },
  };

  try {
    const response = await chatOpenAI.call(
      [
        new SystemMessage('You are a helpful assistant that summarizes chat messages.'),
        new HumanMessage(
          `Summarize these messages. Provide an overall summary and a summary for each message with its corresponding ID: ${JSON.stringify(messages.slice(-5))}`
        ),
      ],
      {
        functions: [summarizeFunction],
        function_call: { name: 'summarize_messages' },
      }
    );

    const functionCall = response.additional_kwargs.function_call;
    if (functionCall && functionCall.name === 'summarize_messages') {
      const { overallSummary, individualSummaries } = JSON.parse(functionCall.arguments);

      const overallSummaryString = overallSummary;
      const individualSummariesArray = individualSummaries.map(summary => ({
        id: summary.id,
        summary: summary.summary,
      }));

      logger.info(`Overall Summary: ${overallSummaryString}`);
      logger.info(`Individual Summaries: ${JSON.stringify(individualSummariesArray)}`);

      return {
        overallSummary: overallSummaryString,
        individualSummaries: individualSummariesArray,
      };
    }
    return { overallSummary: 'Unable to generate summary', individualSummaries: [] };
  } catch (error) {
    const chatData = { sessionId, messages: messages.slice(-5) };
    logChatDataError('summarizeMessages', chatData, error);
    throw error;
  }
}

/**
 * Rephrases the input string.
 * @param {string} inputString - The input string to rephrase.
 * @returns {Promise<string>} - The rephrased input.
 */
async function rephraseInput(inputString) {
  logger.info('Rephrasing input');
  const chatModel = new ChatOpenAI({
    modelName: 'mixtral-8x7b-32768',
    openAIApiKey: import.meta.env.OPENAI_API_PROJECT_KEY,
  });

  const systemMessage = new SystemMessage(
    'You are a rephraser. Always respond with a rephrased version of the input given to a search engine API. Always be succinct and use the same words as the input. ONLY RETURN THE REPHRASED VERSION OF THE INPUT.'
  );
  const humanMessage = new HumanMessage(inputString);

  const response = await chatModel.call([systemMessage, humanMessage]);
  logger.info('Rephrased input obtained');
  return response.content.trim();
}

/**
 * Generates an optimized prompt based on the input.
 * @param {string} input - The user input.
 * @returns {Promise<string>} - The optimized prompt.
 */
async function generateOptimizedPrompt(input) {
  const template = `
Given the user input: {input}

Generate an optimized prompt that:
1. Clarifies any ambiguities in the input.
2. Adds relevant context or background information.
3. Specifies the desired output format or structure.
4. Encourages a comprehensive and detailed response.
5. Includes any necessary constraints or guidelines.

Optimized prompt:
  `;

  const promptTemplate = new PromptTemplate({
    template: template,
    inputVariables: ['input'],
  });

  const optimizedPrompt = await promptTemplate.format({ input });

  const response = await chatOpenAI.call([new SystemMessage(optimizedPrompt)]);

  return response.content.trim();
}

/**
 * Performs a completion using the Perplexity AI API.
 * @param {string} prompt - The prompt to send to Perplexity AI.
 * @param {string} perplexityApiKey - The API key for Perplexity AI.
 * @returns {Promise<object>} - The completion result with citations.
 */
async function performPerplexityCompletion(prompt, perplexityApiKey) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid prompt: Prompt must be a non-empty string.');
  }
  if (!perplexityApiKey || typeof perplexityApiKey !== 'string') {
    throw new Error('Invalid API key: API key must be a non-empty string.');
  }
  try {
    const data = {
      ...perplexityConfig,
      messages: [
        {
          role: 'system',
          content:
            'Provide a concise answer. Include in-text citations in the format [citation_number], and return a separate list of citations.',
        },
        { role: 'user', content: prompt },
      ],
    };
    const config = {
      method: 'post',
      url: 'https://api.perplexity.ai/chat/completions',
      headers: {
        Authorization: `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      data: data,
    };
    logger.info(`Perplexity completion: ${prompt}`);
    const response = await axios(config);
    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response format from Perplexity API.');
    }

    const completion = response.data.choices[0].message.content.trim();
    const citations = response.data.choices[0].message.citations || [];
    logger.info(`Perplexity completion response: ${completion} - Citations: ${citations.length}`);

    return {
      pageContent: completion,
      metadata: {
        source: 'Perplexity AI',
        citations,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        logger.error(
          `Perplexity API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        );
        throw new Error(`Perplexity API error: ${error.response.status}`);
      } else if (error.request) {
        logger.error('No response received from Perplexity API.');
        throw new Error('No response received from Perplexity API.');
      } else {
        logger.error('Error setting up the request:', error.message);
        throw new Error('Error setting up the request to Perplexity API.');
      }
    } else {
      logger.error('Unexpected error during Perplexity completion:', error);
      throw new Error('Unexpected error during Perplexity completion.');
    }
  }
}

/**
 * Searches for styled-components based on a query.
 * @param {string} query - The search query.
 * @returns {Promise<string>} - The formatted search results.
 */
async function searchStyledComponents(query) {
  try {
    const response = await axios.post(
      'https://api.example.com/llm-search',
      {
        query,
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.LLM_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;
    const formattedData = {
      type: 'styled-components',
      results: data.results.map(result => ({
        title: result.title,
        description: result.description,
        example: result.example,
        link: result.link,
      })),
    };
    return JSON.stringify(formattedData, null, 2);
  } catch (error) {
    logger.error('Error searching for styled components:', error);
    return JSON.stringify({ error: 'Failed to search for styled components' });
  }
}
const analyzeTextWithGPT = async text => {
  try {
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
    });
    const response = await openai.Completion.create({
      model: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL,
      prompt: `You are a PI, Extract relevant information about the following content:\n\n${text}`,
      max_tokens: 200,
    });
    return response.choices[0].text.trim();
  } catch (error) {
    logger.error('Error analyzing text with GPT:', error);
    return 'Could not analyze content.';
  }
};
const openApp = async options => {
  try {
    const { appName } = options;
    return new Promise((resolve, reject) => {
      exec(`open -a "${appName}"`, (error, stdout, stderr) => {
        if (error) {
          console.warn(error);
          reject(`Error opening ${appName}: ${error.message}`);
        }
        resolve(`${appName} opened successfully.`);
      });
    });
  } catch (error) {
    logger.error('Error opening app:', error);
    return 'Error opening app';
  }
};
const scrapeWebsite = async options => {
  const { url } = options;
  try {
    const websiteName = new URL(url).hostname;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDirectory = path.join('.', 'output');
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }
    const saveFileName = `${websiteName}_${timestamp}.html`;
    const saveFilePathWithDate = path.join(outputDirectory, saveFileName);
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: 'new',
      },
      gotoOptions: {
        waitUntil: 'domcontentloaded',
      },
      async evaluate(page, browser) {
        const html = await page.evaluate(() => document.documentElement.innerHTML);
        fs.writeFileSync(saveFilePathWithDate, html);
        return `Website HTML saved to ${saveFilePathWithDate}`;
      },
    });
    await loader.load();
    return `Website HTML saved to ${saveFilePathWithDate}`;
  } catch (error) {
    console.error('Error occurred while scraping HTML:', error);
    throw error;
  }
};
const takeScreenshot = async ({ url }) => {
  try {
    const websiteName = new URL(url).hostname;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const outputDirectory = path.join('.', 'output');
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    const screenshotFileName = `${websiteName}_${timestamp}.png`;
    const screenshotFilePathWithDate = path.join(outputDirectory, screenshotFileName);

    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: 'new',
      },
      gotoOptions: {
        waitUntil: 'domcontentloaded',
      },
      async evaluate(page, browser) {
        await page.screenshot({
          path: screenshotFilePathWithDate,
        });
        return `Screenshot saved to ${screenshotFilePathWithDate}`;
      },
    });

    await loader.load();

    return `Screenshot saved to ${screenshotFilePathWithDate}`;
  } catch (error) {
    console.error('Error occurred while taking a screenshot:', error);
    throw error;
  }
};
const openLivePreview = async ({ url }) => {
  try {
    const { component_code, user_id, preview_options } = args;

    // Validate required parameters
    if (!component_code || !user_id || !preview_options) {
      throw new Error('Missing required parameters');
    }

    // Validate preview_options
    if (!preview_options.theme || typeof preview_options.show_code !== 'boolean') {
      throw new Error('Invalid preview_options');
    }

    // Simulate the process of opening a live preview
    console.log(`Opening live preview for user ${user_id}`);
    console.log(`Rendering component with code: ${component_code}`);
    console.log(
      `Preview options: Theme - ${preview_options.theme}, Show Code - ${preview_options.show_code}`
    );

    // In a real implementation, you would:
    // 1. Set up a rendering environment for the React component
    // 2. Apply the specified theme
    // 3. Render the component
    // 4. If show_code is true, display the source code alongside the preview
    // 5. Return a URL or identifier for the live preview

    // For this example, we'll just return a mock result
    return {
      status: 'success',
    };
  } catch (error) {
    console.error('Error occurred while opening live preview:', error);
    throw error;
  }
};
const evalCodeInBrowser = async ({ code }) => {
  try {
    const result = eval(code);
    return result;
  } catch (error) {
    return `Error: ${error.message}`;
  }
};

export {
  extractKeywords,
  generateChatTitle,
  categorizeUserQuery,
  generateActionItems,
  summarizeMessages,
  rephraseInput,
  generateOptimizedPrompt,
  performPerplexityCompletion,
  searchStyledComponents,
  takeScreenshot,
  openApp,
  scrapeWebsite,
  openLivePreview,
  evalCodeInBrowser,
  analyzeTextWithGPT,
};

// module.exports = {
//   extractKeywords,
//   generateChatTitle,
//   categorizeUserQuery,
//   generateActionItems,
//   summarizeMessages,
//   rephraseInput,
//   generateOptimizedPrompt,
//   performPerplexityCompletion,
//   searchStyledComponents,
//   openAIFunctions,
//   evalCodeInBrowser,
//   analyzeTextWithGPT,
// };
