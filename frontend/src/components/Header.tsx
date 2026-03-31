import { Button } from './ui/button';
import { RotateCcw, Plane } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
}

export function Header({ onReset }: HeaderProps) {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Plane className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Flight Booking Assistant</h1>
            <p className="text-sm text-gray-500">Book your flight through conversation</p>
          </div>
        </div>
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          New Conversation
        </Button>
      </div>
    </header>
  );
}
