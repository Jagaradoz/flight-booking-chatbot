export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ToolData {
  tool: string;
  result: Record<string, unknown>;
}

export interface ChatResult {
  text: string;
  tool_data: ToolData[];
}
