import { useStoreSelector } from '@/store/useStore';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageCircle } from "lucide-react";

export function ChatHistory() {
  const { 
    chats, 
    activeChat, 
    onChatSelect, 
    createChat 
  } = useStoreSelector(state => ({
    chats: state.chats,
    activeChat: state.activeChat,
    onChatSelect: state.setActiveChat,
    createChat: state.createChat
  }));

  return (
    <div className="w-[260px] h-full bg-gray-50 border-r">
      <div className="p-4">
        <Button 
          className="w-full justify-start gap-2" 
          onClick={createChat}
        >
          <PlusCircle size={20} />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-2 space-y-2">
          {chats.map((chat) => (
            <Button
              key={chat.id}
              variant={chat.id === activeChat?.id ? "secondary" : "ghost"}
              className="w-full justify-start gap-2 truncate"
              onClick={() => onChatSelect(chat)}
            >
              <MessageCircle size={16} />
              <span className="truncate">{chat.title || 'New Chat'}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 