import html2canvas from "html2canvas";

export const formatChatMessage = (message) => {
  if (typeof message.content === "string") {
    return message.content;
  }

  return message.content.reduce((acc, content) => {
    if (content.type === "text") {
      return acc + content.text;
    }
    // Handle other content types as needed
    return acc;
  }, "");
};

export const parseMessageContent = (content) => {
  try {
    // Handle markdown, code blocks, etc.
    return content.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, language, code) => {
      return `<pre><code class="language-${language || "text"}">${code}</code></pre>`;
    });
  } catch (error) {
    console.error("Error parsing message content:", error);
    return content;
  }
};

// Function to convert HTML to an image using html2canvas
export const htmlToImg = async (html) => {
  const needResize = window.innerWidth >= 1024;
  const initialWidth = html.style.width;
  if (needResize) {
    html.style.width = "1023px";
  }
  const canvas = await html2canvas(html);
  if (needResize) html.style.width = initialWidth;
  const dataURL = canvas.toDataURL("image/png");
  return dataURL;
};

// Function to download the image as a file
export const downloadImg = (imgData, fileName) => {
  const link = document.createElement("a");
  link.href = imgData;
  link.download = fileName;
  link.click();
  link.remove();
};

// Function to convert a chat object to markdown format
export const chatToMarkdown = (chat) => {
  let markdown = `# ${chat.title}\n\n`;
  chat.messages.forEach((message) => {
    markdown += `### **${message.role}**:\n\n${message.content}\n\n---\n\n`;
  });
  return markdown;
};

// Function to download the markdown content as a file
export const downloadMarkdown = (markdown, fileName) => {
  const link = document.createElement("a");
  const markdownFile = new Blob([markdown], { type: "text/markdown" });
  link.href = URL.createObjectURL(markdownFile);
  link.download = fileName;
  link.click();
  link.remove();
};
