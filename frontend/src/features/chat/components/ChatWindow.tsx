import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { LoadingIndicator } from './LoadingIndicator';
import { CollapsibleProgress } from './CollapsibleProgress';
import type { Message } from '@/features/chat/types';
import type { BookingStep } from '@/features/trip-panel/types';
import { MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  streamingMessage: Message | null;
  bookingStep: BookingStep;
}

export function ChatWindow({ messages, isLoading, streamingMessage, bookingStep }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, streamingMessage]);

  return (
    <div className="flex-1 bg-muted/30 overflow-hidden relative">
      <CollapsibleProgress currentStep={bookingStep} />
      <ScrollArea className="h-full" ref={scrollRef}>
        {messages.length === 0 && !isLoading ? (
          <div className="px-4 py-6 sm:px-6">
            <div className="flex min-h-[300px] h-full items-center justify-center sm:min-h-[400px]">
              <div className="max-w-2xl space-y-3 text-center">
                <div className="inline-flex items-center justify-center gap-2 text-primary">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wide">Ready to assist</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
                  Book your next flight
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
Search flights, compare options, choose seats, add extras, and complete your booking. All through a simple natural conversation.                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 pb-6 pt-24 sm:px-6 sm:pb-8 sm:pt-28">
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {streamingMessage && <ChatMessage message={streamingMessage} isStreaming />}
              {isLoading && <LoadingIndicator />}
            </>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
