'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { aiApi, ChatMessage, ChatSession, AssistantType, MessageRole } from '@/lib/ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Hide widget on auth pages to block non-logged-in users
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  useEffect(() => {
    if (isOpen && !session) {
      initChat();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initChat = async () => {
    try {
      setIsLoading(true);
      // Try to get existing learner sessions
      const sessions = await aiApi.getSessions(AssistantType.LEARNER);
      if (sessions.length > 0) {
        setSession(sessions[0]);
        await aiApi.clearMessages(sessions[0].id);
        setMessages([]);
      } else {
        const newSession = await aiApi.createSession(AssistantType.LEARNER, 'LMS Helper');
        setSession(newSession);
      }
    } catch (error) {
      console.error('Failed to init chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !session || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Optimistic update (optional, but better to wait for backend to ensure persistence)
    // For now we wait for backend response which includes the saved user message and assistant response
    
    try {
      setIsLoading(true);
      const assistantMsg = await aiApi.sendMessage(session.id, userMessage);
      
      // Refresh messages to get both user and assistant ones correctly
      const history = await aiApi.getMessages(session.id);
      setMessages(history);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold text-lg">Learn n Earn Assistant</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/10 text-primary-foreground">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground py-10 italic">
                  How can I help you today?
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.role === MessageRole.USER ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 shrink-0 rounded-full flex items-center justify-center border",
                    msg.role === MessageRole.USER ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {msg.role === MessageRole.USER ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={cn(
                    "rounded-2xl px-4 py-2 text-sm shadow-sm",
                    msg.role === MessageRole.USER ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 mr-auto max-w-[85%]">
                  <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center border bg-muted animate-pulse">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted text-foreground rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t p-4 flex gap-2 bg-muted/30">
            <Input
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="bg-background rounded-full focus-visible:ring-primary"
            />
            <Button 
                onClick={handleSend} 
                className="rounded-full h-10 w-10 p-0" 
                disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full shadow-xl hover:scale-105 transition-transform"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>
    </div>
  );
};
