
export const perplexitySearch = async query => {
  try {
    const response = await fetch('https://api.perplexity.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results.map(result => result.text).join('\n');
  } catch (error) {
    console.error('Error occurred during Perplexity search:', error);
    return 'An error occurred while performing the search.';
  }
};
