import { Button } from './ui/button';
import { Menu, Plane, RotateCcw, X } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onTogglePanel: () => void;
  isPanelOpen: boolean;
}

export function Header({ onReset, onTogglePanel, isPanelOpen }: HeaderProps) {
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
        <div className="flex items-center gap-2">
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="hidden gap-2 lg:inline-flex"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          <Button
            onClick={onTogglePanel}
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label={isPanelOpen ? 'Close trip panel' : 'Open trip panel'}
            aria-expanded={isPanelOpen}
            aria-controls="mobile-right-panel"
          >
            {isPanelOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
