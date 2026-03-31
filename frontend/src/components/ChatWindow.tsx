import { useEffect, useRef } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { LoadingIndicator } from './LoadingIndicator';
import { Message } from '@/types';
import { MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100">
      <ScrollArea className="h-full" ref={scrollRef}>
        <div className="container mx-auto px-4 py-6">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="bg-primary/10 p-6 rounded-full mb-4">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Welcome to Flight Booking Assistant
              </h2>
              <p className="text-gray-500 max-w-md">
                Start a conversation by typing a message below. I can help you search for flights,
                select seats, add baggage, and complete your booking.
              </p>
              <div className="mt-6 text-sm text-gray-400">
                <p className="mb-1">Try saying:</p>
                <p className="italic">"I need to fly from Bangkok to Tokyo on April 15th"</p>
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
