export const tryJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return { text };
  }
};