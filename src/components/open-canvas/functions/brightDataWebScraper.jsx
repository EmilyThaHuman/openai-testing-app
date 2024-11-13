import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_PROJECT_KEY,
  dangerouslyAllowBrowser: true,
});
const UrlExtraction = z.object({
  url: z.string(),
});

export async function brightDataWebScraper(
  mentionTool,
  userMessage,
  streamable
) {
  let targetUrl;
  try {
    const urlCompletion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content:
            'Extract the most likely valid URL from a natural language query.',
        },
        { role: 'user', content: userMessage },
      ],
      response_format: zodResponseFormat(UrlExtraction, 'extractedUrl'),
    });

    const extractedUrl = urlCompletion.choices[0]?.message?.parsed?.url ?? '';

    if (!extractedUrl) {
      streamable.update({
        llmResponse: `No valid URL found in the user message \n\n`,
      });
      throw new Error('No valid URL found in the user message');
    }

    streamable.update({
      llmResponse: `Extracting Information from: [${extractedUrl}](${extractedUrl}) \n\n`,
    });

    targetUrl = extractedUrl;

    const apiUrl = `http://localhost:3001/api/bright-data`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: targetUrl, query: userMessage }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    if (!responseData.content) {
      throw new Error('No content received from the server');
    }

    let contentForLLM = responseData.content;

    const summaryStream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      stream: true,
      messages: [
        {
          role: 'system',
          content:
            'Always respond in valid markdown format to the user query based on the context provided',
        },
        {
          role: 'user',
          content: `Here is the context: <context>${contentForLLM}</context> Response to the user query: ${userMessage}`,
        },
      ],
    });

    for await (const chunk of summaryStream) {
      if (chunk.choices[0]?.delta?.content) {
        streamable.update({ llmResponse: chunk.choices[0].delta.content });
      }
    }

    streamable.done({ llmResponseEnd: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    try {
      let userFriendlyMessage = `Sorry, I was unable to get information from the website. `;
      if (errorMessage.includes('No content received')) {
        userFriendlyMessage +=
          'The website data could not be processed correctly. This might be due to changes in the website structure or temporary issues.';
      } else {
        userFriendlyMessage += errorMessage;
      }
      streamable.update({ llmResponse: userFriendlyMessage });
      streamable.done({ llmResponseEnd: true });
    } catch (streamError) {
      // Error handling for stream update failure
    }
  }
}

export default brightDataWebScraper;
