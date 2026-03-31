import { Button } from './ui/button';
import { RotateCcw, Plane } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
}

export function Header({ onReset }: HeaderProps) {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-primary p-2 rounded-md flex-shrink-0">
            <Plane className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground truncate">Flight Booking Chatbot</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Conversational booking assistant</p>
          </div>
        </div>
        <Button onClick={onReset} variant="outline" size="sm" className="gap-2 flex-shrink-0">
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">New</span>
        </Button>
      </div>
    </header>
  );
}
