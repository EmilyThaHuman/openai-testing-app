import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

// Import individual icons
import Code from 'lucide-react/dist/esm/icons/code';
import Pencil from 'lucide-react/dist/esm/icons/pencil';
import Image from 'lucide-react/dist/esm/icons/image';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import GitBranch from 'lucide-react/dist/esm/icons/git-branch';
import Database from 'lucide-react/dist/esm/icons/database';
import FileQuestion from 'lucide-react/dist/esm/icons/file-question';
import Plus from 'lucide-react/dist/esm/icons/plus';

const CATEGORIES = {
  code: { name: 'Code', icon: Code },
  writing: { name: 'Writing', icon: Pencil },
  image: { name: 'Image', icon: Image },
  chat: { name: 'Chat', icon: MessageSquare },
  roleplay: { name: 'Roleplay', icon: GitBranch },
  data: { name: 'Data Analysis', icon: Database },
  general: { name: 'General', icon: FileQuestion },
};

const PromptDialog = ({ open, onClose }) => {
  const [view, setView] = useState('list');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    content: '',
    description: '',
    role: '',
    variables: '',
  });
  const [errors, setErrors] = useState({});

  const [prompts, setPrompts] = useState([
    {
      id: 1,
      name: 'Code Review',
      category: 'code',
      content: 'Review this code for best practices and improvements...',
      description: 'AI-powered code review assistant',
      role: 'code reviewer',
      variables: ['language', 'focus_areas'],
    },
  ]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleCreatePrompt = e => {
    e.preventDefault();
    if (!validateForm()) return;

    const newPrompt = {
      id: Date.now(),
      ...formData,
      variables: formData.variables
        .split(',')
        .map(v => v.trim())
        .filter(Boolean),
    };

    setPrompts([...prompts, newPrompt]);
    setFormData({
      name: '',
      category: 'general',
      content: '',
      description: '',
      role: '',
      variables: '',
    });
    setView('list');
  };

  const PromptCard = ({ prompt }) => {
    const Icon = CATEGORIES[prompt.category]?.icon || FileQuestion;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        className="group"
      >
        <Card className="p-4 cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {prompt.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {prompt.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFormData(prompt);
                setSelectedPrompt(prompt);
                setView('edit');
              }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  };

  const PromptForm = ({ onSubmit, isEdit }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Give your prompt a name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={value =>
              handleInputChange({
                target: { name: 'category', value },
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORIES).map(([key, { name, icon: Icon }]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Content</Label>
          <Textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Enter your prompt content..."
            className={`h-32 ${errors.content ? 'border-red-500' : ''}`}
          />
          {errors.content && (
            <p className="text-sm text-red-500 mt-1">{errors.content}</p>
          )}
        </div>

        <div>
          <Label>Description</Label>
          <Input
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what this prompt does"
          />
        </div>

        <div>
          <Label>Role</Label>
          <Input
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            placeholder="e.g. code reviewer, story writer"
          />
        </div>

        <div>
          <Label>Variables (comma-separated)</Label>
          <Input
            name="variables"
            value={formData.variables}
            onChange={handleInputChange}
            placeholder="e.g. language, style, tone"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setView('list');
            setFormData({
              name: '',
              category: 'general',
              content: '',
              description: '',
              role: '',
              variables: '',
            });
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? 'Update Prompt' : 'Create Prompt'}
        </Button>
      </div>
    </form>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Prompt Generator</DialogTitle>
          <DialogDescription>
            Create and manage your chat prompts
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end">
          {view === 'list' && (
            <Button onClick={() => setView('create')}>
              <Plus className="w-4 h-4 mr-2" />
              New Prompt
            </Button>
          )}
        </div>

        <ScrollArea className="h-[60vh] mt-4">
          <AnimatePresence mode="wait">
            {view === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {prompts.map(prompt => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PromptForm
                  onSubmit={handleCreatePrompt}
                  isEdit={view === 'edit'}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PromptDialog;
