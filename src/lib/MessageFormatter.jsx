import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";

export class MessageFormatter {
  /**
   * @param {string} content
   * @returns {Promise<string>}
   */
  static async format(content) {
    // Configure marked
    const renderer = new marked.Renderer();
    renderer.code = (text, lang, escaped) => {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return `<pre><code class="hljs ${language}">${
        hljs.highlight(text, { language }).value
      }</code></pre>`;
    };

    marked.setOptions({
      renderer,
    });

    // Parse markdown
    const html = await marked(content);

    // Sanitize HTML
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "b",
        "i",
        "em",
        "strong",
        "code",
        "pre",
        "a",
        "ul",
        "ol",
        "li",
        "blockquote",
      ],
      ALLOWED_ATTR: ["href", "class", "target"],
    });

    return clean;
  }

  /**
   * @param {string} content
   * @returns {Array<{language: string, code: string}>}
   */
  static extractCodeBlocks(content) {
    const codeBlocks = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1] || "plaintext",
        code: match[2].trim(),
      });
    }

    return codeBlocks;
  }
}
