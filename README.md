# OpenAI Testing Platform

A comprehensive React-based testing platform for OpenAI's APIs featuring a modern UI, built with Shadcn UI components and offering extensive testing capabilities for various OpenAI services.

## ✨ Features

- **🤖 Complete OpenAI API Integration**

  - Chat Completions
  - Assistants API
  - File Operations
  - Fine-tuning
  - Image Generation
  - Audio Processing

- **🎯 Advanced Testing Tools**

  - Interactive Chat Testing
  - Assistant Instance Management
  - File Processing & Vector Stores
  - Function Calling Testing
  - Performance Monitoring
  - Code Interpretation

- **💻 Developer Experience**

  - Modern React Patterns
  - Real-time API Metrics
  - Syntax Highlighting
  - File Upload Capabilities
  - Customizable Settings
  - Advanced Code Editor

- **🎨 UI/UX**
  - Sleek Modern Interface
  - Dark/Light Mode
  - Responsive Design
  - Interactive Components
  - Real-time Updates
  - Toast Notifications

## 🚀 Tech Stack

- **Frontend Framework**

  - React 18
  - Vite
  - Framer Motion
  - React Router
  - Zustand (State Management)

- **UI Components**

  - Shadcn UI
  - Tailwind CSS
  - Radix UI
  - Monaco Editor
  - Recharts

- **API Integration**

  - OpenAI SDK
  - Axios
  - WebSocket Support
  - Rate Limiting
  - Error Handling

- **Development Tools**
  - TypeScript Support
  - ESLint
  - Prettier
  - Vitest
  - Testing Library
  - Husky

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/openai-testing-platform.git
cd openai-testing-platform
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Add your OpenAI API key and other required variables to `.env`

4. **Start development server**

```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── ai/                   # AI-related configurations
├── components/           # React components
│   ├── chat/            # Chat components
│   ├── tools/           # Tool components
│   └── ui/              # UI components
├── context/             # React contexts
├── hooks/               # Custom hooks
├── lib/                 # Utility libraries
├── pages/               # Page components
├── services/            # API services
├── store/               # State management
└── utils/               # Utility functions
```

## 🔧 Configuration

The application can be configured through various settings:

- **API Settings**: Configure API endpoints and keys
- **UI Preferences**: Customize theme and layout
- **Tool Settings**: Configure available tools and features
- **Performance**: Adjust rate limiting and caching

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run validate` - Run all checks (lint, types, build)

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for their amazing APIs
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [Vite](https://vitejs.dev/) for the build tooling

## 📧 Contact

Your Name - [@yourusername](https://twitter.com/yourusername) - email@example.com

Project Link: [https://github.com/yourusername/openai-testing-platform](https://github.com/yourusername/openai-testing-platform)
