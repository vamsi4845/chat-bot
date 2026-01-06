"use client";

import { ChatMessage as ChatMessageType } from "@/types/chat";
import { ReasoningAccordion } from "./ReasoningAccordion";
import { MessageBubble } from "./MessageBubble";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user";

  return (
    <div
      className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[80%] ${isUser ? "" : "w-full"}`}>
        {!isUser && message.thinking && (
          <ReasoningAccordion content={message.thinking} />
        )}
        <MessageBubble
          text={message.text}
          isUser={isUser}
          timestamp={message.timestamp}
        />
      </div>
    </div>
  );
}
