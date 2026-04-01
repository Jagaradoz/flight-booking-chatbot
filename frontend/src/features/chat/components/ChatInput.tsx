import { useEffect, useRef, useState, KeyboardEvent, RefObject } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isBusy: boolean;
  focusRequestKey?: number;
  resetRequestKey?: number;
  inputRef?: RefObject<HTMLInputElement>;
}

export function ChatInput({ onSendMessage, isBusy, focusRequestKey = 0, resetRequestKey = 0, inputRef }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const internalInputRef = useRef<HTMLInputElement>(null);
  const resolvedInputRef = inputRef ?? internalInputRef;

  useEffect(() => {
    resolvedInputRef.current?.focus();
  }, [focusRequestKey, resolvedInputRef]);

  useEffect(() => {
    setInputValue('');
    resolvedInputRef.current?.focus();
  }, [resetRequestKey, resolvedInputRef]);

  const handleSend = () => {
    if (inputValue.trim() && !isBusy) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      requestAnimationFrame(() => {
        resolvedInputRef.current?.focus();
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isBusy) {
        handleSend();
      }
    }
  };

  return (
    <div className="border-t border-border bg-card p-3 sm:p-4">
      <div className="container mx-auto flex gap-2">
        <Input
          type="text"
          placeholder={isBusy ? 'Assistant is responding...' : 'Type your message...'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={resolvedInputRef}
          className="flex-1 text-sm sm:text-base focus-visible:ring-0 focus-visible:ring-offset-0"
          autoFocus
        />
        <Button
          onClick={handleSend}
          disabled={isBusy || !inputValue.trim()}
          size="icon"
          aria-label="Send message"
          className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
