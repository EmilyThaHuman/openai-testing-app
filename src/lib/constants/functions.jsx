import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { PuppeteerWebBaseLoader } from '@langchain/community/document_loaders/web/puppeteer';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { SystemMessage } from '@langchain/core/messages';

const logger = console;

// Tool Configuration
export const AI_TOOL_CONFIG = {
  tools: [
    {
      name: 'extract_keywords',
      description: 'Extract main keywords from given text',
      path: 'ai/extractKeywords.js',
      required_args: ['text']
    },
    {
      name: 'analyze_text',
      description: 'Analyze text content using GPT',
      path: 'ai/analysis/analyzeComponent.js',
      required_args: ['text']
    },
    {
      name: 'scrape_website',
      description: 'Scrape content from a website',
      path: 'web/scrapeWebsite.js',
      required_args: ['url']
    },
    {
      name: 'take_screenshot',
      description: 'Take a screenshot of a website',
      path: 'web/takeScreenshot.js',
      required_args: ['url']
    },
    {
      name: 'search_styled',
      description: 'Search for styled-components',
      path: 'web/searchStyledComponents.js',
      required_args: ['query']
    },
    {
      name: 'perplexity_search',
      description: 'Perform a search using Perplexity AI',
      path: 'api/perplexity/perplexitySearch.jsx',
      required_args: ['query']
    },
    {
      name: 'optimize_prompt',
      description: 'Generate an optimized prompt',
      path: 'ai/optimizePrompt.js',
      required_args: ['input']
    },
    {
      name: 'summarize_chat',
      description: 'Summarize chat messages',
      path: 'ai/summarizeMessages.js',
      required_args: ['messages', 'sessionId']
    }
  ]
};

// OpenAI Configuration
const chatOpenAI = new ChatOpenAI({
  modelName: import.meta.env.VITE_OPENAI_API_CHAT_COMPLETION_MODEL || 'gpt-3.5-turbo',
  openAIApiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
});

// Perplexity Configuration
const perplexityConfig = {
  model: 'llama3-8b-8192',
  apiKey: import.meta.env.PERPLEXITY_API_KEY,
};

// Function Implementations
export async function extractKeywords(text) {
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

export async function performPerplexityCompletion(prompt, perplexityApiKey) {
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
          content: 'Provide a concise answer. Include in-text citations in the format [citation_number], and return a separate list of citations.',
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
        logger.error(`Perplexity API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
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

export async function scrapeWebsite(options) {
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
}

export async function takeScreenshot({ url }) {
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
}
