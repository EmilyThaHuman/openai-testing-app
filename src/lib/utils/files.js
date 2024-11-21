import {
  FileCode,
  FileJson,
  FileText,
  FileType,
  Image,
  File,
} from 'lucide-react';

export const FILE_TYPES = {
  javascript: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    icon: FileCode,
    language: 'javascript',
  },
  json: {
    extensions: ['.json'],
    icon: FileJson,
    language: 'json',
  },
  markdown: {
    extensions: ['.md', '.mdx'],
    icon: FileText,
    language: 'markdown',
  },
  image: {
    extensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
    icon: Image,
    language: 'image',
  },
};

export function getFileType(filename) {
  const extension = `.${filename.split('.').pop().toLowerCase()}`;
  return (
    Object.entries(FILE_TYPES).find(([_, type]) =>
      type.extensions.includes(extension)
    )?.[0] || 'text'
  );
}

export function getFileIcon(filename) {
  const type = getFileType(filename);
  return FILE_TYPES[type]?.icon || File;
}

export function getFileLanguage(filename) {
  const type = getFileType(filename);
  return FILE_TYPES[type]?.language || 'text';
}

// Auto-save debounce helper
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const DEFAULT_FILES = [
  {
    id: 'welcome.js',
    name: 'welcome.js',
    content: `// Welcome to ReedAI Code Editor
// This is your starting point for exploring and coding

function greet(name) {
  return \`Hello, \${name}! 👋\`
}

// Try calling the function
console.log(greet('Developer'))

// Explore the features:
// - File management
// - Code completion
// - AI assistance
// - Real-time collaboration
`,
    language: 'javascript',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'example.jsx',
    name: 'example.jsx',
    content: `import React from 'react'

export function ExampleComponent() {
  const [count, setCount] = React.useState(0)

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        Example React Component
      </h1>
      <button 
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Count: {count}
      </button>
    </div>
  )
}`,
    language: 'javascript',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'styles.css',
    name: 'styles.css',
    content: `/* Main styles */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;
  --background: #ffffff;
  --text: #1f2937;
}

.dark {
  --background: #1f2937;
  --text: #ffffff;
}

body {
  background-color: var(--background);
  color: var(--text);
  font-family: system-ui, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  transition: all 150ms ease;
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}`,
    language: 'css',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'api.ts',
    name: 'api.ts',
    content: `// Example TypeScript API client

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  setToken(token: string) {
    this.token = token;
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await fetch(\`\${this.baseUrl}/users/\${id}\`, {
      headers: {
        Authorization: \`Bearer \${this.token}\`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  }
}

export const api = new ApiClient('https://api.example.com');`,
    language: 'typescript',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'README.md',
    name: 'README.md',
    content: `# ReedAI Code Editor

Welcome to the ReedAI Code Editor! This is a powerful development environment that combines:

- 🚀 Modern code editing
- 🤖 AI assistance
- 🔄 Real-time collaboration
- 📁 File management
- 🎨 Syntax highlighting
- ⚡️ Fast performance

## Features

### Code Editing
- Syntax highlighting
- Code completion
- Multiple language support
- Real-time error checking

### AI Integration
- Code suggestions
- Documentation help
- Bug fixing assistance
- Code explanations

### Collaboration
- Real-time editing
- File sharing
- Chat interface
- Version control

## Getting Started

1. Create a new file using the file explorer
2. Write or paste your code
3. Use AI assistance with the chat interface
4. Save and share your work

## Keyboard Shortcuts

- \`Cmd/Ctrl + S\`: Save file
- \`Cmd/Ctrl + B\`: Toggle sidebar
- \`Cmd/Ctrl + P\`: Quick file open
- \`Cmd/Ctrl + Shift + P\`: Command palette

## Support

Need help? Check out our documentation or reach out to support.`,
    language: 'markdown',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getDefaultFiles = () => {
  // Return a deep copy to prevent mutations
  return DEFAULT_FILES.map(file => ({
    ...file,
    id: `default-${file.id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};
