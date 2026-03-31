import { Avatar, AvatarFallback } from './ui/avatar';
import { Bot } from 'lucide-react';
import { Message } from '@/types';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-2 sm:gap-3 mb-4 sm:mb-5 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!isUser && (
        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
          <AvatarFallback className="bg-slate-700">
            <Bot className="h-5 w-5 sm:h-5 sm:w-5 text-white" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'max-w-[75%] sm:max-w-[70%] rounded-lg px-3 py-2.5 sm:px-4 sm:py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border border-border text-card-foreground'
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
