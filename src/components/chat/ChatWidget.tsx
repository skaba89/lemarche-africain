'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, X, Bot, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============================================================
// Types
// ============================================================

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
}

// ============================================================
// Quick Actions
// ============================================================

const QUICK_ACTIONS = [
  'Suivi de commande',
  'Modes de paiement',
  'Délai de livraison',
  'Politique de retour',
];

// ============================================================
// ChatWidget Component
// ============================================================

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: 'Bonjour ! Bienvenue sur Le Marché Africain. Comment puis-je vous aider aujourd\'hui ?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setUnreadCount(0);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setShowQuickActions(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await res.json();

      if (data.reply) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'bot',
          content: data.reply,
        };
        setMessages((prev) => [...prev, botMessage]);

        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }
      } else {
        setError('Désolé, je n\'ai pas pu traiter votre demande. Réessayez.');
      }
    } catch {
      setError('Désolé, une erreur est survenue. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  const handleRetry = () => {
    setError(null);
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMessage) {
        sendMessage(lastUserMessage.content);
      }
    }
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[360px] h-[480px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-[slideUp_0.25s_ease-out]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Support Client</p>
                <p className="text-[10px] text-green-200 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300 inline-block" />
                  En ligne
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-[#1B5E20] text-white rounded-2xl rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-[bounce_1s_infinite_0ms]" />
                    <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-[bounce_1s_infinite_150ms]" />
                    <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-[bounce_1s_infinite_300ms]" />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex justify-start">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl rounded-bl-md px-3 py-2 text-sm text-red-700 dark:text-red-400 max-w-[85%]">
                    <p>{error}</p>
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-1 mt-1.5 text-xs font-medium text-red-600 dark:text-red-300 hover:underline"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Réessayer
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {showQuickActions && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Questions fréquentes :</p>
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleQuickAction(action)}
                      className="block w-full text-left text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#E8F5E9] dark:hover:bg-[#1B5E20]/10 hover:border-[#1B5E20] dark:hover:border-[#1B5E20] transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}

              <div ref={scrollEndRef} />
            </div>
          </ScrollArea>

          {/* Input Bar */}
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écrivez votre message..."
                disabled={isLoading}
                className="flex-1 h-9 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] disabled:opacity-50 transition-colors"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-9 w-9 rounded-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white shrink-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-20 right-4 z-40 md:bottom-[4.5rem] md:right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B5E20] text-white shadow-lg transition-all hover:bg-[#2E7D32] active:scale-95"
          aria-label="Ouvrir le chat support"
        >
          <MessageCircle className="h-6 w-6" />

          {/* Pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-[#1B5E20] animate-ping opacity-20" />

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </>
  );
}
