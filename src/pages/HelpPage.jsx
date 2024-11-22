import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toolRegistry } from '@/lib/constants/ToolRegistry';
import { motion } from 'framer-motion';
import {
  Book,
  Bot,
  ChevronRight,
  Code,
  Database,
  FileText,
  Globe,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  Search,
  Settings2,
  Wand2,
} from 'lucide-react';
import { useState } from 'react';

const categories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: Book,
    description: 'Learn the basics of using OpenCanvas',
  },
  {
    id: 'tools',
    name: 'Tools & Functions',
    icon: Wand2,
    description: 'Explore available tools and their capabilities',
  },
  {
    id: 'web',
    name: 'Web Tools',
    icon: Globe,
    description: 'Web scraping and browser automation',
  },
  {
    id: 'ai',
    name: 'AI Tools',
    icon: Bot,
    description: 'AI-powered features and models',
  },
  {
    id: 'data',
    name: 'Data Analysis',
    icon: Database,
    description: 'Data processing and analysis tools',
  },
  {
    id: 'system',
    name: 'System Tools',
    icon: Settings2,
    description: 'System utilities and operations',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('getting-started');

  // Filter tools based on search query and category
  const filteredTools = Object.entries(toolRegistry).filter(([key, tool]) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'getting-started' ||
      (selectedCategory === 'tools' && !tool.category) ||
      tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container max-w-7xl mx-auto py-8 px-4"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Help & Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Learn how to use OpenCanvas tools and features
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search documentation..."
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <Card className="p-4 md:col-span-1">
          <nav className="space-y-2">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? 'default' : 'ghost'
                  }
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.name}
                </Button>
              );
            })}
          </nav>
        </Card>

        {/* Main Content */}
        <Card className="p-6 md:col-span-3">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {selectedCategory === 'getting-started' ? (
              <GettingStartedContent />
            ) : (
              <ToolsList tools={filteredTools} />
            )}
          </ScrollArea>
        </Card>
      </div>
    </motion.div>
  );
}

function GettingStartedContent() {
  return (
    <motion.div variants={containerVariants} className="space-y-8">
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-4">Welcome to OpenCanvas</h2>
        <p className="text-muted-foreground">
          OpenCanvas is a powerful development environment that combines AI
          assistance with a rich set of tools for web development, data
          analysis, and more.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-xl font-semibold">Key Features</h3>
        <div className="grid gap-4">
          {[
            {
              icon: Code,
              title: 'Interactive Development',
              description:
                'Write and execute code with real-time AI assistance',
            },
            {
              icon: MessageSquare,
              title: 'AI Chat Interface',
              description: 'Get help and explanations from AI assistants',
            },
            {
              icon: ImageIcon,
              title: 'Image Generation',
              description: 'Generate images using AI models',
            },
            {
              icon: Mic,
              title: 'Audio Processing',
              description: 'Convert speech to text and process audio files',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg border"
            >
              <feature.icon className="h-6 w-6 text-primary" />
              <div>
                <h4 className="font-medium">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-semibold mb-4">Quick Start Guide</h3>
        <ol className="space-y-4">
          <li className="flex items-center gap-4">
            <span className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              1
            </span>
            <p>Set up your API keys in the settings panel</p>
          </li>
          <li className="flex items-center gap-4">
            <span className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              2
            </span>
            <p>Create a new file or open an existing one</p>
          </li>
          <li className="flex items-center gap-4">
            <span className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              3
            </span>
            <p>Start coding with AI assistance</p>
          </li>
        </ol>
      </motion.div>
    </motion.div>
  );
}

function ToolsList({ tools }) {
  return (
    <motion.div variants={containerVariants} className="space-y-6">
      {tools.map(([key, tool]) => (
        <motion.div
          key={key}
          variants={itemVariants}
          className="p-4 rounded-lg border hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium">{tool.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {tool.description}
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {tool.requiresAuth && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Requires authentication
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default HelpPage;
