/* -------------------------------------------------------------------------- */
/*                                Code / UI                                   */
/* -------------------------------------------------------------------------- */
const searchStyledComponentsTool = {
  type: "function",
  function: {
    name: "searchStyledComponents",
    description: "Search for styled components using the given query",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query for styled components",
        },
        components: {
          type: "array",
          description: "The components to search for",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The name of the component",
              },
              description: {
                type: "string",
                description: "The description of the component",
              },
              example: {
                type: "string",
                description: "An example of the component",
              },
              link: {
                type: "string",
                description: "The link to the component",
              },
            },
            required: ["name", "description", "example", "link"],
          },
        },
        required: ["query", "components"],
      },
    },
  },
};
const searchStyledComponents = {
  name: "searchStyledComponents",
  description: "Searches for styled-components based on a query.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query.",
      },
    },
    required: ["query"],
  },
};
/* -------------------------------------------------------------------------- */
/*                                PreProcess                                  */
/* -------------------------------------------------------------------------- */
const extractKeyWords = {
  name: "extractKeywords",
  description: "Extracts the main keywords from the provided text.",
  parameters: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The text to extract keywords from.",
      },
    },
    required: ["text"],
  },
};
const generateChatTitle = {
  name: "generateChatTitle",
  description: "Generates a concise chat title based on the first user prompt.",
  parameters: {
    type: "object",
    properties: {
      firstPrompt: {
        type: "string",
        description: "The user's first prompt.",
      },
    },
    required: ["firstPrompt"],
  },
};
const categorizeUserQuery = {
  name: "categorizeUserQuery",
  description: "Categorizes a user's query into predefined categories.",
  parameters: {
    type: "object",
    properties: {
      userQuery: {
        type: "string",
        description: "The user's query.",
      },
    },
    required: ["userQuery"],
  },
};
const generateActionItems = {
  name: "generateActionItems",
  description: "Generates actionable items from a user's query.",
  parameters: {
    type: "object",
    properties: {
      userQuery: {
        type: "string",
        description: "The user's query.",
      },
    },
    required: ["userQuery"],
  },
};
const summarizeMessages = {
  type: "function",
  function: {
    name: "summarizeMessages",
    description:
      "Summarize a list of chat messages with an overall summary and individual message summaries including their IDs.",
    parameters: {
      type: "object",
      properties: {
        messages: {
          type: "array",
          description: "The last 5 messages to summarize.",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "The ID of the chat message.",
              },
              content: {
                type: "string",
                description: "The content of the chat message.",
              },
            },
            required: ["id", "content"],
          },
        },
        sessionId: {
          type: "string",
          description: "The session ID for the chat.",
        },
      },
      required: ["messages", "sessionId"],
    },
  },
};
const summarizeFunction = {
  type: "function",
  function: {
    name: "summarize_messages",
    description:
      "Summarize a list of chat messages with an overall summary and individual message summaries including their IDs",
    parameters: {
      type: "object",
      properties: {
        overallSummary: {
          type: "string",
          description: "An overall summary of the chat messages",
        },
        individualSummaries: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "The ID of the chat message",
              },
              summary: {
                type: "string",
                description: "A summary of the individual chat message",
              },
            },
            required: ["id", "summary"],
          },
        },
      },
      required: ["overallSummary", "individualSummaries"],
    },
  },
};
const rephraseInput = {
  name: "rephraseInput",
  description: "Rephrases the input string.",
  parameters: {
    type: "object",
    properties: {
      inputString: {
        type: "string",
        description: "The input string to rephrase.",
      },
    },
    required: ["inputString"],
  },
};
const generateOptimizedPrompt = {
  name: "generateOptimizedPrompt",
  description: "Generates an optimized prompt based on the input.",
  parameters: {
    type: "object",
    properties: {
      input: {
        type: "string",
        description: "The user input.",
      },
    },
    required: ["input"],
  },
};
/* -------------------------------------------------------------------------- */
/*                                  Context                                   */
/* -------------------------------------------------------------------------- */
const performPerplexityCompletion = {
  name: "performPerplexityCompletion",
  description: "Performs a completion using the Perplexity AI API.",
  parameters: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "The prompt to send to Perplexity AI.",
      },
      perplexityApiKey: {
        type: "string",
        description: "The API key for Perplexity AI.",
      },
    },
    required: ["prompt", "perplexityApiKey"],
  },
};
const fetchSearchResults = {
  type: "function",
  function: {
    name: "fetchSearchResults",
    description:
      "Fetch search results for a given query using SERP API used to aid in being  PRIVATE INVESTIGATOR",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Query string to search for",
        },
      },
      required: ["query"],
    },
  },
};
const analyzeImage = {
  type: "function",
  function: {
    name: "analyzeImage",
    description: "Analyze the content of an image using OpenAI's Vision API",
    parameters: {
      type: "object",
      properties: {
        imageUrl: {
          type: "string",
          description: "URL of the image to analyze",
        },
      },
      required: ["imageUrl"],
    },
  },
};
const codeInterpreter = {
  type: "code_interpreter",
  // Details about the code interpreter tool

  function: {
    name: "execute_code",
    description: "Execute code and provide the output",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Code to execute",
        },
      },
      required: ["code"],
    },
  },
};
const fileSearch = {
  type: "retrieval",
  // Details about the retrieval tool
  function: {
    name: "search_files",
    description:
      "Search for files containing a specific query in a given directory",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        directory: { type: "string" },
      },
      required: ["query", "directory"],
    },
  },
};
const openApp = {
  name: "openApp",
  description: "Opens a specified application on your computer",
  parameters: {
    type: "object",
    properties: {
      appName: {
        type: "string",
        description: "The name of the application to open",
      },
    },
    required: ["appName"],
  },
  example: "Open the 'Calculator' application",
};
const scrapeWebsite = {
  name: "scrapeWebsite",
  description: "Scrape the HTML of a website",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL of the website to scrape the HTML",
      },
    },
    required: ["url"],
  },
  example: "Scrape the HTML for Google",
};
const takeScreenshot = {
  name: "takeScreenshot",
  description: "Take a screenshot of a website",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL of the website to take a screenshot",
      },
    },
    required: ["url"],
  },
  example: "Take a screenshot of the amazon homepage",
};
/* -------------------------------------------------------------------------- */
/*                                  Outputs                                   */
/* -------------------------------------------------------------------------- */
const evalCodeInBrowser = {
  name: "evalCodeInBrowser",
  description: "Execute javascript code in the browser with eval().",
  parameters: {
    type: "object",
    properties: {
      code: {
        type: "string",
        description: `Javascript code that will be directly executed via eval(). Do not use backticks in your response.
           DO NOT include any newlines in your response, and be sure to provide only valid JSON when providing the arguments object.
           The output of the eval() will be returned directly by the function.`,
      },
    },
    required: ["code"],
  },
};
const openLivePreview = {
  name: "open_live_preview",
  description:
    "Generates a live preview rendering of the component/code responses in a MERN stack app's React Agent/Assistant",
  strict: true,
  parameters: {
    type: "object",
    required: ["component_code", "user_id", "preview_options"],
    properties: {
      component_code: {
        type: "string",
        description: "The code of the React component to be rendered",
      },
      user_id: {
        type: "string",
        description: "The unique identifier of the user requesting the preview",
      },
      preview_options: {
        type: "object",
        description: "Options for customizing the live preview rendering",
        properties: {
          theme: {
            type: "string",
            description:
              "The theme to be applied to the preview (e.g., light or dark)",
          },
          show_code: {
            type: "boolean",
            description:
              "Flag to determine whether to display the source code alongside the preview",
          },
        },
        additionalProperties: false,
        required: ["theme", "show_code"],
      },
    },
    additionalProperties: false,
  },
};

// Tool definitions
const toolDefinitions = [
  searchStyledComponentsTool,
  searchStyledComponents,
  extractKeyWords,
  generateChatTitle,
  categorizeUserQuery,
  generateActionItems,
  summarizeMessages,
  summarizeFunction,
  rephraseInput,
  generateOptimizedPrompt,
  performPerplexityCompletion,
  fetchSearchResults,
  analyzeImage,
  codeInterpreter,
  fileSearch,
  openApp,
  scrapeWebsite,
  takeScreenshot,
  evalCodeInBrowser,
  openLivePreview,
];

// Utility function to generate the toolPrompts map and tools array
const generateToolData = (definitions) => {
  const toolPrompts = {};
  const tools = [];

  definitions.forEach((tool) => {
    // Using the tool's name as the key for toolPrompts
    if (tool.name) {
      toolPrompts[tool.name.toUpperCase()] = JSON.stringify(tool);
      tools.push(tool);
    } else if (tool.function && tool.function.name) {
      // For tools with a 'function' property
      toolPrompts[tool.function.name.toUpperCase()] = JSON.stringify(
        tool.function
      );
      tools.push(tool.function);
    }
  });

  return { toolPrompts, tools };
};

// Generate toolPrompts map and tools array
const { toolPrompts, tools } = generateToolData(toolDefinitions);

export default {
  tools,
  toolPrompts,
};
