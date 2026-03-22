'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, LayoutDashboard, BarChart, Database } from 'lucide-react';
import { aiApi, ChatMessage, ChatSession, AssistantType, MessageRole } from '@/lib/ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const AdminAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initChat = async () => {
    try {
      setIsLoading(true);
      const sessions = await aiApi.getSessions(AssistantType.ADMIN);
      if (sessions.length > 0) {
        setSession(sessions[0]);
        const history = await aiApi.getMessages(sessions[0].id);
        setMessages(history);
      } else {
        const newSession = await aiApi.createSession(AssistantType.ADMIN, 'Admin Operations Hub');
        setSession(newSession);
      }
    } catch (error) {
      console.error('Failed to init admin chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (suggestedPrompt?: string) => {
    const textToSend = suggestedPrompt || input;
    if (!textToSend.trim() || !session || isLoading) return;

    setInput('');
    
    try {
      setIsLoading(true);
      await aiApi.sendMessage(session.id, textToSend);
      const history = await aiApi.getMessages(session.id);
      setMessages(history);
    } catch (error) {
      console.error('Failed to send admin message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { text: "Summarize platform revenue", icon: <BarChart className="h-4 w-4" /> },
    { text: "List most popular courses", icon: <LayoutDashboard className="h-4 w-4" /> },
    { text: "Check database health", icon: <Database className="h-4 w-4" /> },
    { text: "Generate student activity report", icon: <Sparkles className="h-4 w-4" /> },
  ];

  return (
    <Card className="flex h-[700px] flex-col overflow-hidden border-none shadow-none bg-transparent">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          Admin Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about platform data, revenue, or student and course metrics.
        </CardDescription>
      </CardHeader>
      
      <div className="flex flex-1 flex-col overflow-hidden mt-4">
        {/* Messages */}
        <div className="flex-1 px-6 overflow-y-auto" ref={scrollRef}>
          <div className="space-y-6 py-4">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center gap-4">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Welcome, Administrator</h3>
                  <p className="text-muted-foreground max-w-md mt-2">
                    I'm here to help you manage "Learn n Earn". Try one of the suggestions below to get started.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full max-w-md mt-4">
                  {suggestions.map((s, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      className="justify-start gap-2 h-auto py-3 text-xs"
                      onClick={() => handleSend(s.text)}
                    >
                      {s.icon}
                      {s.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-4 max-w-[90%]",
                  msg.role === MessageRole.USER ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "h-10 w-10 shrink-0 rounded-full flex items-center justify-center border-2",
                  msg.role === MessageRole.USER ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-muted"
                )}>
                  {msg.role === MessageRole.USER ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={cn(
                  "rounded-2xl px-5 py-3 text-sm shadow-md leading-relaxed",
                  msg.role === MessageRole.USER 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-background border text-foreground rounded-tl-none"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 mr-auto max-w-[90%]">
                <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center border-2 bg-muted border-muted animate-pulse">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-background border text-foreground rounded-2xl rounded-tl-none px-5 py-3 text-sm shadow-md flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce"></span>
                  </div>
                  <span className="font-medium text-primary">Processing platform data...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="p-6 pt-2">
          <div className="relative flex items-center">
            <Input
              placeholder="Ask me anything about the platform..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="pr-16 h-14 rounded-xl shadow-inner focus-visible:ring-primary text-base"
              disabled={isLoading}
            />
            <Button 
                onClick={() => handleSend()} 
                className="absolute right-2 h-10 w-10 p-0 rounded-lg" 
                disabled={isLoading || !input.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
