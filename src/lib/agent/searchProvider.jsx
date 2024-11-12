const { REACT_AGENT_CONFIG } = require('@/config/ai/agent');

export const fetchJson = async (url, options) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export async function getSearchResults(userMessage) {
  switch (REACT_AGENT_CONFIG.searchProvider) {
    case 'brave':
      return braveSearch(userMessage);
    case 'serper':
      return serperSearch(userMessage);
    case 'google':
      return googleSearch(userMessage);
    default:
      throw new Error(
        `Unsupported search provider: ${REACT_AGENT_CONFIG.searchProvider}`
      );
  }
}

export async function braveSearch(
  message,
  numberOfPagesToScan = REACT_AGENT_CONFIG.numberOfPagesToScan
) {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(message)}&count=${numberOfPagesToScan}`;
  const options = {
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY,
    },
  };
  const jsonResponse = await fetchJson(url, options);
  if (!jsonResponse.web || !jsonResponse.web.results) {
    throw new Error('Invalid API response format');
  }
  return jsonResponse.web.results.map(result => ({
    title: result.title,
    link: result.url,
    favicon: result.profile.img,
  }));
}

export async function googleSearch(
  message,
  numberOfPagesToScan = REACT_AGENT_CONFIG.numberOfPagesToScan
) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_CX}&q=${encodeURIComponent(message)}&num=${numberOfPagesToScan}`;
  const jsonResponse = await fetchJson(url);
  if (!jsonResponse.items) {
    throw new Error('Invalid API response format');
  }
  return jsonResponse.items.map(result => ({
    title: result.title,
    link: result.link,
    favicon: result.pagemap?.cse_thumbnail?.[0]?.src || '',
  }));
}

export async function serperSearch(
  message,
  numberOfPagesToScan = REACT_AGENT_CONFIG.numberOfPagesToScan
) {
  const url = 'https://google.serper.dev/search';
  const data = JSON.stringify({ q: message });
  const options = {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API,
      'Content-Type': 'application/json',
    },
    body: data,
  };
  const jsonResponse = await fetchJson(url, options);
  if (!jsonResponse.organic) {
    throw new Error('Invalid API response format');
  }
  return jsonResponse.organic.map(result => ({
    title: result.title,
    link: result.link,
    favicon: result.favicons?.[0] || '',
  }));
}

export async function getImages(message) {
  const url = 'https://google.serper.dev/images';
  const data = JSON.stringify({ q: message });
  const options = {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API,
      'Content-Type': 'application/json',
    },
    body: data,
  };
  const jsonResponse = await fetchJson(url, options);
  const validLinks = await Promise.all(
    jsonResponse.images.map(async image => {
      const link = image.imageUrl;
      if (typeof link === 'string') {
        try {
          const imageResponse = await fetch(link, { method: 'HEAD' });
          if (imageResponse.ok) {
            const contentType = imageResponse.headers.get('content-type');
            if (contentType && contentType.startsWith('image/')) {
              return { title: image.title, link };
            }
          }
        } catch (error) {
          console.error(`Error fetching image link ${link}:`, error);
        }
      }
      return null;
    })
  );
  return validLinks.filter(link => link !== null).slice(0, 9);
}

export async function getVideos(message) {
  const url = 'https://google.serper.dev/videos';
  const data = JSON.stringify({ q: message });
  const options = {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API,
      'Content-Type': 'application/json',
    },
    body: data,
  };
  const jsonResponse = await fetchJson(url, options);
  const validLinks = await Promise.all(
    jsonResponse.videos.map(async video => {
      const imageUrl = video.imageUrl;
      if (typeof imageUrl === 'string') {
        try {
          const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
          if (imageResponse.ok) {
            const contentType = imageResponse.headers.get('content-type');
            if (contentType && contentType.startsWith('image/')) {
              return { imageUrl, link: video.link };
            }
          }
        } catch (error) {
          console.error(`Error fetching image link ${imageUrl}:`, error);
        }
      }
      return null;
    })
  );
  return validLinks.filter(link => link !== null).slice(0, 9);
}

export default {
  getSearchResults,
  getImages,
  getVideos,
};

// const handleSearchRequest = async (req, res) => {
//   const { query } = req.query;
//   if (!query) {
//     return res.status(400).json({ error: 'Query parameter is required' });
//   }
//   try {
//     const results = await getSearchResults(query);
//     res.json(results);
//   } catch (error) {
//     console.error('Error handling search request:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
