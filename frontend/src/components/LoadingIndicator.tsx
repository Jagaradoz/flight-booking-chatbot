export function LoadingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
        <div className="h-4 w-4 text-secondary-foreground">⚡</div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
