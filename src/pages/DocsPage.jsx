import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Book,
  Code,
  Search,
  ExternalLink,
  ChevronRight,
  FileText,
  Terminal,
  Zap,
} from 'lucide-react';

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

const DOCS_URL = import.meta.env.VITE_DOCS_URL || 'https://docs.reed-ai.dev';

const categories = [
  {
    title: 'Getting Started',
    icon: Book,
    items: [
      { title: 'Introduction', path: '/introduction' },
      { title: 'Quick Start', path: '/quickstart' },
      { title: 'Installation', path: '/installation' },
      { title: 'Authentication', path: '/authentication' },
    ],
  },
  {
    title: 'API Reference',
    icon: Code,
    items: [
      { title: 'Chat API', path: '/api/chat' },
      { title: 'Assistants API', path: '/api/assistants' },
      { title: 'Images API', path: '/api/images' },
      { title: 'Audio API', path: '/api/audio' },
    ],
  },
  {
    title: 'Examples',
    icon: FileText,
    items: [
      { title: 'Chat Examples', path: '/examples/chat' },
      { title: 'Image Generation', path: '/examples/images' },
      { title: 'Audio Processing', path: '/examples/audio' },
      { title: 'Advanced Usage', path: '/examples/advanced' },
    ],
  },
];

const handleDocNavigation = path => {
  if (path.startsWith('http')) {
    window.open(path, '_blank');
  } else {
    const mintlifyPath = `https://docs.reed-ai.dev${path}`;
    window.open(mintlifyPath, '_blank');
  }
};

const handleExternalLink = path => {
  window.open(`${DOCS_URL}${path}`, '_blank');
};

export function DocsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocs, setFilteredDocs] = useState(categories);

  useEffect(() => {
    if (searchQuery) {
      const filtered = categories
        .map(category => ({
          ...category,
          items: category.items.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(category => category.items.length > 0);
      setFilteredDocs(filtered);
    } else {
      setFilteredDocs(categories);
    }
  }, [searchQuery]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container max-w-7xl py-8 px-4"
    >
      <div className="flex flex-col space-y-8">
        <motion.div variants={itemVariants} className="space-y-4">
          <h1 className="text-4xl font-bold">Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Learn how to integrate and use the ReedAI API in your applications
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredDocs.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle>{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <motion.div
                          key={itemIndex}
                          whileHover={{ x: 4 }}
                          className="flex items-center justify-between"
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-between"
                            onClick={() => handleExternalLink(item.path)}
                          >
                            <span>{item.title}</span>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Terminal className="h-5 w-5 text-primary" />
                <CardTitle>CLI Tools</CardTitle>
              </div>
              <CardDescription>
                Command line tools for interacting with the API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleExternalLink('/cli')}
              >
                <span>View CLI Documentation</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>API Status</CardTitle>
              </div>
              <CardDescription>
                Check the current status of the API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() =>
                  window.open('https://status.reed-ai.dev', '_blank')
                }
              >
                <span>View Status Page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default DocsPage;
