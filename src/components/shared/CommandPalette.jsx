import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquarePlus,
  Settings,
  Moon,
  Sun,
  Trash2,
  Download,
  Share2,
  Search
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const { 
    chats,
    activeChat,
    createChat,
    setActiveChat,
    clearChat,
    exportChat,
    shareChat
  } = useStore((state) => state.chat);
  
  const { theme, setTheme } = useStore((state) => state.ui);

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        >
          <Command
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-popover border rounded-xl shadow-lg overflow-hidden"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false);
            }}
          >
            <div className="flex items-center border-b px-3">
              <Search className="w-4 h-4 mr-2 opacity-50" />
              <Command.Input
                placeholder="Type a command or search..."
                className="flex-1 h-12 bg-transparent outline-none placeholder:text-muted-foreground"
                value={search}
                onValueChange={setSearch}
              />
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto p-2">
              <Command.Group heading="Quick Actions">
                <Command.Item
                  onSelect={() => {
                    createChat();
                    setOpen(false);
                  }}
                >
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  New Chat
                </Command.Item>
                
                <Command.Item
                  onSelect={() => {
                    setTheme(theme === 'dark' ? 'light' : 'dark');
                    setOpen(false);
                  }}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 mr-2" />
                  ) : (
                    <Moon className="w-4 h-4 mr-2" />
                  )}
                  Toggle Theme
                </Command.Item>

                {activeChat && (
                  <>
                    <Command.Item
                      onSelect={() => {
                        clearChat(activeChat.id);
                        setOpen(false);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Current Chat
                    </Command.Item>

                    <Command.Item
                      onSelect={() => {
                        exportChat(activeChat.id);
                        setOpen(false);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Current Chat
                    </Command.Item>

                    <Command.Item
                      onSelect={() => {
                        shareChat(activeChat.id);
                        setOpen(false);
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Current Chat
                    </Command.Item>
                  </>
                )}
              </Command.Group>

              {chats.length > 0 && (
                <Command.Group heading="Recent Chats">
                  {chats
                    .filter(chat => 
                      chat.title.toLowerCase().includes(search.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((chat) => (
                      <Command.Item
                        key={chat.id}
                        onSelect={() => {
                          setActiveChat(chat.id);
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center">
                          <span className="truncate">{chat.title}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {new Date(chat.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Command.Item>
                    ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 