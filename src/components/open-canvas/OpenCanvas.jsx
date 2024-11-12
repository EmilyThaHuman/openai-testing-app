import React, { useEffect, useState, useCallback } from "react";
import { Editor } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  ChevronRight,
  Robot,
  User,
  ThumbsUp,
  ThumbsDown,
  Check,
  MoreVertical,
  Menu,
  CheckCircle2,
  Save
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const editorOptions = {
  minimap: { enabled: false },
  fontFamily: "Monaco, Menlo, 'Courier New', monospace",
  fontSize: 14,
  lineNumbers: "on",
  roundedSelection: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  theme: "vs-light"
};

export default function OpenCanvas() {
  // State
  const [content, setContent] = useLocalStorage("editor-content", '// Start coding here');
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [messages, setMessages] = useLocalStorage("chat-messages", []);
  const [inputMessage, setInputMessage] = useState("");

  // Handle editor changes
  const handleEditorChange = useCallback((value) => {
    setContent(value);
    setIsSaved(false);
  }, [setContent]);

  // Save content
  const handleSave = useCallback(() => {
    setIsSaved(true);
    // Additional save logic here if needed
  }, []);

  // Add message
  const handleAddMessage = useCallback(() => {
    if (!inputMessage.trim()) return;
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      content: inputMessage,
      sender: 'user'
    }]);
    setInputMessage("");
  }, [inputMessage, setMessages]);

  const menuItems = [
    { label: "Save", icon: <Save className="w-4 h-4 mr-2" />, action: handleSave },
    { label: "Share", icon: <CheckCircle2 className="w-4 h-4 mr-2" /> },
    { label: "Settings", icon: <Menu className="w-4 h-4 mr-2" /> }
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Chat Sidebar */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-1/4 border-r border-border p-4 flex flex-col justify-between"
      >
        <ScrollArea className="flex-1 pr-4">
          <div className="flex items-center mb-4">
            <Robot className="w-6 h-6 mr-2 text-primary" />
            <span className="font-bold text-lg">Assistant</span>
          </div>
          
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-4"
            >
              <div className="flex items-center mb-2">
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4 mr-2" />
                ) : (
                  <Robot className="w-4 h-4 mr-2" />
                )}
                <p className="text-sm text-foreground">{msg.content}</p>
              </div>
              {msg.sender === 'assistant' && (
                <div className="flex gap-2 mt-2">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </ScrollArea>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Write a message..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddMessage()}
            />
            <Button onClick={handleAddMessage}>Send</Button>
          </div>
        </div>
      </motion.div>

      {/* Editor Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 p-4 flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-bold">Quick start code</h2>
            <Button variant="ghost" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isSaved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center text-muted-foreground"
              >
                <Check className="w-4 h-4 mr-1" />
                <span className="text-sm">Saved</span>
              </motion.div>
            )}
            
            <TooltipProvider>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Menu</TooltipContent>
                </Tooltip>
                <DropdownMenuContent>
                  {menuItems.map((item, index) => (
                    <DropdownMenuItem 
                      key={index}
                      onClick={item.action}
                      className="flex items-center"
                    >
                      {item.icon}
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>
        </div>

        <Card className="flex-1">
          <CardContent className="p-0 h-full">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={content}
              onChange={handleEditorChange}
              theme="vs-light"
              options={editorOptions}
            />
          </CardContent>
        </Card>

        <AnimatePresence>
          {showQuickSettings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 right-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Settings</CardTitle>
                  <CardDescription>Customize your editor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quick settings content */}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}