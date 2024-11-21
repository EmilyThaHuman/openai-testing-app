import axios from 'axios';

export async function searchStyledComponents(query) {
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
    console.error('Error searching for styled components:', error);
    return JSON.stringify({ error: 'Failed to search for styled components' });
  }
}
