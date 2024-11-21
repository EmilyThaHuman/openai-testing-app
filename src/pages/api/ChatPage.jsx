import React, { useState, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatSettings } from '@/components/chat/ChatSettings';
import { Loading } from '@/components/ui/loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ChatPage = () => {
  const { 
    chats,
    activeChat,
    activeChatId,
    isLoading, 
    error,
    createChat,
    deleteChat,
    updateChatTitle,
    clearChat,
    sendMessage,
    setActiveChatId
  } = useChat();
  
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Create initial chat if none exists
  useEffect(() => {
    if (chats.length === 0) {
      createChat();
    }
  }, [chats.length]);

  const handleSend = async (message) => {
    if (!message.trim() || isLoading) return;
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Chat History Sidebar */}
      <div className="w-64 border-r bg-background p-4 flex flex-col">
        <Button 
          className="w-full mb-4"
          onClick={() => createChat()}
        >
          New Chat
        </Button>

        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {chats.map(chat => (
              <Card 
                key={chat.id}
                className={`p-3 cursor-pointer hover:bg-accent ${
                  chat.id === activeChatId ? 'bg-accent' : ''
                }`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium truncate">{chat.title}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                  >
                    ×
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(chat.updatedAt).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </Button>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex">
        <div className={`flex-1 flex flex-col ${showSettings ? 'mr-80' : ''}`}>
          {activeChat ? (
            <>
              <div className="border-b p-4 flex justify-between items-center">
                <input
                  type="text"
                  value={activeChat.title}
                  onChange={(e) => updateChatTitle(activeChatId, e.target.value)}
                  className="text-lg font-semibold bg-transparent border-none focus:outline-none"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => clearChat(activeChatId)}
                >
                  Clear Chat
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {activeChat.messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isUser={message.role === 'user'}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex justify-center">
                      <Loading />
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t p-4">
                <ChatInput onSend={handleSend} disabled={isLoading} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a chat or create a new one to start
            </div>
          )}
        </div>

        {/* Settings Sidebar */}
        {showSettings && (
          <div className="w-80 border-l p-4 bg-background">
            <ChatSettings />
          </div>
        )}
      </div>

      {error && (
        <div className="absolute bottom-4 right-4 p-4 bg-destructive text-destructive-foreground rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatPage;