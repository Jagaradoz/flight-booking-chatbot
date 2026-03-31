import { useEffect, useRef } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { LoadingIndicator } from './LoadingIndicator';
import { CollapsibleProgress } from './CollapsibleProgress';
import { Message } from '@/types';
import { MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  bookingStep: 'search' | 'select' | 'customize' | 'book' | 'confirm';
}

export function ChatWindow({ messages, isLoading, bookingStep }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-1 bg-muted/30 overflow-hidden relative">
      <CollapsibleProgress currentStep={bookingStep} />
      <ScrollArea className="h-full" ref={scrollRef}>
        <div className="px-4 sm:px-6 py-6">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-start justify-center h-full min-h-[300px] sm:min-h-[400px] max-w-2xl">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-primary">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wide">Ready to assist</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
                  Book your next flight
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Search flights, select seats, add services, and complete your booking through natural conversation.
                </p>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Example</p>
                  <p className="text-sm text-foreground/80 font-medium">"I need to fly from Bangkok to Tokyo on April 15th"</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <LoadingIndicator />}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
