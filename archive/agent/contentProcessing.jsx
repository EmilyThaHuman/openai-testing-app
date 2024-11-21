import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Cheerio } from 'cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import { REACT_AGENT_CONFIG } from '@/config/ai/agent';

let embeddings;
if (REACT_AGENT_CONFIG.useOllamaEmbeddings) {
  embeddings = new OllamaEmbeddings({
    model: REACT_AGENT_CONFIG.embeddingsModel,
    baseUrl: 'http://localhost:11434',
  });
} else {
  embeddings = new OpenAIEmbeddings({
    modelName: REACT_AGENT_CONFIG.embeddingsModel,
  });
}

// Fetch contents of top 10 search results
export async function get10BlueLinksContents(sources) {
  async function fetchWithTimeout(url, options = {}, timeout = 800) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (error) {
        console.log(`Skipping ${url}!`);
      }
      throw error;
    }
  }

  function extractMainContent(html) {
    try {
      const $ = Cheerio.load(html);
      $('script, style, head, nav, footer, iframe, img').remove();
      return $('body').text().replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('Error extracting main content:', error);
      throw error;
    }
  }

  const promises = sources.map(async source => {
    try {
      const response = await fetchWithTimeout(source.link, {}, 800);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${source.link}. Status: ${response.status}`
        );
      }
      const html = await response.text();
      const mainContent = extractMainContent(html);
      return { ...source, html: mainContent };
    } catch (error) {
      return null;
    }
  });

  try {
    const results = await Promise.all(promises);
    return results.filter(source => source !== null);
  } catch (error) {
    console.error('Error fetching and processing blue links contents:', error);
    throw error;
  }
}

// Process and vectorize content using LangChain
export async function processAndVectorizeContent(
  contents,
  query,
  textChunkSize = REACT_AGENT_CONFIG.textChunkSize,
  textChunkOverlap = REACT_AGENT_CONFIG.textChunkOverlap,
  numberOfSimilarityResults = REACT_AGENT_CONFIG.numberOfSimilarityResults
) {
  const allResults = [];
  try {
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      if (content.html.length > 0) {
        try {
          const splitText = await new RecursiveCharacterTextSplitter({
            chunkSize: textChunkSize,
            chunkOverlap: textChunkOverlap,
          }).splitText(content.html);
          const vectorStore = await MemoryVectorStore.fromTexts(
            splitText,
            { title: content.title, link: content.link },
            embeddings
          );
          const contentResults = await vectorStore.similaritySearch(
            query,
            numberOfSimilarityResults
          );
          allResults.push(...contentResults);
        } catch (error) {
          console.error(`Error processing content for ${content.link}:`, error);
        }
      }
    }
    return allResults;
  } catch (error) {
    console.error('Error processing and vectorizing content:', error);
    throw error;
  }
}
