import React from 'react';
import { useStoreSelector } from '@/store/useStore';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loading } from '@/components/ui/loading';
import { useInView } from 'react-intersection-observer';
import { Settings2, Trash2 } from 'lucide-react';
import SystemInstructions from '@/components/chat/SystemInstructions';
import EmptyChat from '@/components/chat/EmptyChat';
import EmptySidebar from '@/components/chat/EmptySidebar';
import { ChatSettings } from '@/components/chat/ChatSettings';

export default function ChatTesting() {
  const {
    // State
    chats,
    activeChat,
    messages,
    loading,
    error,
    settings,
    isSettingsOpen,
    isSidebarOpen,
    // Actions
    createChat,
    deleteChat,
    sendMessage,
    clearChat,
    updateChatSettings,
    setIsSettingsOpen,
    setIsSidebarOpen,
    handleFileUpload,
  } = useStoreSelector(state => ({
    // State
    chats: state.chats,
    activeChat: state.activeChat,
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    settings: state.chatSettings,
    isSettingsOpen: state.isSettingsOpen,
    isSidebarOpen: state.isSidebarOpen,
    // Actions
    createChat: state.createChat,
    deleteChat: state.deleteChat,
    sendMessage: state.sendMessage,
    clearChat: state.clearChat,
    updateChatSettings: state.updateChatSettings,
    setIsSettingsOpen: state.setIsSettingsOpen,
    setIsSidebarOpen: state.setIsSidebarOpen,
    handleFileUpload: state.handleFileUpload,
  }));

  const { ref: scrollRef, inView } = useInView();

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (!inView && messages?.length) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, inView]);

  const handleSettingChange = (key, value) => {
    if (!activeChat) return;
    updateChatSettings(activeChat.id, { [key]: value });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="w-56 p-4 overflow-auto border-r">
          {chats?.length === 0 ? (
            <EmptySidebar onNewChat={createChat} />
          ) : (
            <ChatSidebar
              chats={chats}
              activeChat={activeChat}
              onNewChat={createChat}
              onDeleteChat={deleteChat}
            />
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {!activeChat ? (
          <EmptyChat onNewChat={createChat} />
        ) : (
          <>
            {/* Chat Header */}
            <ChatHeader
              isSidebarOpen={isSidebarOpen}
              isSettingsOpen={isSettingsOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
              onClearChat={clearChat}
            />

            {/* System Instructions */}
            <SystemInstructions
              value={activeChat?.settings?.systemPrompt || ''}
              onChange={value => handleSettingChange('systemPrompt', value)}
            />

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages?.map(message => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isUser={message.role === 'user'}
                    files={message.files}
                  />
                ))}
                {loading && <Loading />}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 border-t">
              <ChatInput
                onSend={sendMessage}
                onFileUpload={handleFileUpload}
                disabled={loading}
              />
            </div>
          </>
        )}
      </div>

      {/* Settings Sidebar */}
      {isSettingsOpen && (
        <ChatSettings
          settings={settings}
          onSettingChange={handleSettingChange}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Error Display */}
      {error && <ErrorDisplay error={error} />}
    </div>
  );
}

// Helper Components
const ChatSidebar = ({ chats, activeChat, onNewChat, onDeleteChat }) => {
  return (
    <>
      <Button className="w-full mb-4" onClick={onNewChat}>
        New Chat
      </Button>
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {chats.map(chat => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChat?.id}
              onDelete={() => onDeleteChat(chat.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </>
  );
};

const ChatHeader = ({
  isSidebarOpen,
  isSettingsOpen,
  onToggleSidebar,
  onToggleSettings,
  onClearChat,
}) => {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <Button onClick={onToggleSidebar}>
        {isSidebarOpen ? 'Hide Chats' : 'Show Chats'}
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearChat}
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSettings}
          title="Toggle settings"
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const ChatItem = ({ chat, isActive, onDelete }) => {
  return (
    <Card
      className={`p-3 cursor-pointer hover:bg-accent ${
        isActive ? 'bg-accent' : ''
      }`}
    >
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium truncate">{chat.title}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
        >
          ×
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {new Date(chat.updatedAt).toLocaleDateString()}
      </p>
    </Card>
  );
};

const ErrorDisplay = ({ error }) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
      <Card className="p-4 bg-destructive text-destructive-foreground">
        <p>{error}</p>
      </Card>
    </div>
  );
};
