import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Bot } from 'lucide-react';

export function AssistantAvatar() {
  return (
    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
      <AvatarFallback className="bg-slate-700">
        <Bot className="h-5 w-5 sm:h-5 sm:w-5 text-white" />
      </AvatarFallback>
    </Avatar>
  );
}