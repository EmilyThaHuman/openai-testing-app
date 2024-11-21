import logger from '../utils/logger';

export async function scrapeWithJinaReader({ url }) {
  try {
    const response = await fetch('https://r.jina.ai/', {
      method: 'POST',
      body: JSON.stringify({
        url: url
      }),
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_JINA_READER_API_KEY}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error(`Jina Reader API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Error in scrapeWithJinaReader:', error.message);
    throw new Error('Jina Reader API request failed: ' + error.message);
  }
}
