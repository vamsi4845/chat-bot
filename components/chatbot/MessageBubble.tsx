interface MessageBubbleProps {
  text: string;
  isUser: boolean;
  timestamp?: Date;
}

export function MessageBubble({ text, isUser, timestamp }: MessageBubbleProps) {
  return (
    <div
      className={`rounded-lg px-4 py-2 ${
        isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
      }`}
    >
      <p className="text-sm whitespace-pre-wrap">{text}</p>
      {timestamp && (
        <p
          className={`text-xs mt-1 ${
            isUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
