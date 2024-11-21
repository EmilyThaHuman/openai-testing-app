import React, { useState, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatSettings } from '@/components/chat/ChatSettings';
import { Loading } from '@/components/ui/loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ChatPage = () => {
  const { toast } = useToast();
  const chatContext = useChat();
  const [showSettings, setShowSettings] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Handle null chat context
  if (!chatContext) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertDescription>
            Chat service is currently unavailable. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { 
    chats = [],
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
  } = chatContext;

  // Create initial chat if none exists
  useEffect(() => {
    const initializeChat = async () => {
      if (!chats || chats.length === 0) {
        try {
          await createChat();
        } catch (error) {
          console.error('Failed to create initial chat:', error);
          toast({
            title: 'Error',
            description: 'Failed to initialize chat. Please refresh the page.',
            variant: 'destructive'
          });
        }
      }
    };

    initializeChat();
  }, [chats, createChat, toast]);

  const handleSend = async (message) => {
    if (!message?.trim() || !activeChatId) return;

    setIsSending(true);
    try {
      await sendMessage({
        chatId: activeChatId,
        content: message,
        role: 'user'
      });
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertDescription>
            {error.message || 'An error occurred. Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="w-64 border-r bg-background p-4 flex flex-col min-h-0">
          <Button 
            className="w-full mb-4"
            onClick={() => createChat()}
            disabled={isLoading}
          >
            New Chat
          </Button>

          <ScrollArea className="flex-1">
            {chats?.map((chat) => (
              <Card
                key={chat.id}
                className={cn(
                  'mb-2 p-3 cursor-pointer hover:bg-accent transition-colors',
                  chat.id === activeChatId && 'bg-accent'
                )}
                onClick={() => setActiveChatId(chat.id)}
              >
                <p className="truncate text-sm">
                  {chat.title || 'New Chat'}
                </p>
              </Card>
            ))}
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
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {activeChat?.messages?.map((message, index) => (
              <ChatMessage
                key={`${message.id || index}`}
                message={message}
                isLast={index === activeChat.messages.length - 1}
              />
            ))}
            {isLoading && <Loading className="my-4" />}
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-4 border-t">
            <ChatInput
              value={messageInput}
              onChange={setMessageInput}
              onSend={handleSend}
              disabled={isSending || isLoading || !activeChatId}
              isLoading={isSending}
            />
          </div>
        </div>

        {/* Settings Sidebar */}
        {showSettings && (
          <div className="w-80 border-l p-4 bg-background">
            <ChatSettings />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;