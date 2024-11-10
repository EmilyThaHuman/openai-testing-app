export const formatChatMessage = (message) => {
  if (typeof message.content === 'string') {
    return message.content;
  }

  return message.content.reduce((acc, content) => {
    if (content.type === 'text') {
      return acc + content.text;
    }
    // Handle other content types as needed
    return acc;
  }, '');
};

export const parseMessageContent = (content) => {
  try {
    // Handle markdown, code blocks, etc.
    return content.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, language, code) => {
      return `<pre><code class="language-${language || 'text'}">${code}</code></pre>`;
    });
  } catch (error) {
    console.error('Error parsing message content:', error);
    return content;
  }
}; 