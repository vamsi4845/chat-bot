"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HttpAgent, EventType, randomUUID } from "@ag-ui/client";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { ReasoningAccordion } from "./ReasoningAccordion";
import { MessageBubble } from "./MessageBubble";
import { ChevronRight } from "lucide-react";

export function Chatbot() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState<string>("");
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<HttpAgent | null>(null);
  const threadIdRef = useRef<string>(`thread-${Date.now()}`);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentReasoning, currentMessage, scrollToBottom]);

  const resetStreamingState = useCallback(() => {
    setIsLoading(false);
    setCurrentReasoning("");
    setCurrentMessage("");
    setIsReasoningExpanded(false);
  }, []);

  useEffect(() => {
    if (!agentRef.current) {
      agentRef.current = new HttpAgent({
        url: "/api/chat",
        threadId: threadIdRef.current,
      });
    }
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!agentRef.current) return;

      const userMessage: ChatMessageType = {
        id: randomUUID(),
        text,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updatedMessages = [...prev, userMessage];

        if (agentRef.current) {
          agentRef.current.messages = [
            ...updatedMessages.map((msg) => ({
              id: msg.id,
              role:
                msg.sender === "user"
                  ? ("user" as const)
                  : ("assistant" as const),
              content: msg.text,
            })),
          ];
        }

        return updatedMessages;
      });

      setIsLoading(true);
      setCurrentReasoning("");
      setCurrentMessage("");
      setIsReasoningExpanded(false);

      const botMessageId = randomUUID();
      let reasoningBuffer = "";
      let messageBuffer = "";
      let currentTextMessageId = "";

      try {
        await agentRef.current.runAgent(
          {
            runId: randomUUID(),
            tools: [],
            context: [],
          },
          {
            onRunStartedEvent: () => {
              setIsLoading(true);
            },
            onEvent: ({ event }) => {
              if (event.type === EventType.THINKING_START) {
                reasoningBuffer = "";
                setCurrentReasoning("");
              } else if (event.type === EventType.THINKING_TEXT_MESSAGE_START) {
                reasoningBuffer = "";
                setCurrentReasoning("");
              } else if (
                event.type === EventType.THINKING_TEXT_MESSAGE_CONTENT
              ) {
                const thinkingEvent = event as any;
                reasoningBuffer += thinkingEvent.delta || "";
                setCurrentReasoning(reasoningBuffer);
              } else if (event.type === EventType.THINKING_TEXT_MESSAGE_END) {
                setCurrentReasoning(reasoningBuffer);
              } else if (event.type === EventType.THINKING_END) {
                setCurrentReasoning(reasoningBuffer);
              }
            },
            onTextMessageStartEvent: ({ event }) => {
              currentTextMessageId = event.messageId;
              messageBuffer = "";
              setCurrentMessage("");
            },
            onTextMessageContentEvent: ({ event, textMessageBuffer }) => {
              messageBuffer = textMessageBuffer;
              setCurrentMessage(textMessageBuffer);
            },
            onTextMessageEndEvent: ({ textMessageBuffer }) => {
              const botMessage: ChatMessageType = {
                id: botMessageId,
                text: textMessageBuffer,
                sender: "bot",
                timestamp: new Date(),
                thinking: reasoningBuffer || undefined,
              };
              setMessages((prev) => [...prev, botMessage]);
              setCurrentReasoning("");
              setCurrentMessage("");
              reasoningBuffer = "";
              messageBuffer = "";
            },
            onRunFinishedEvent: () => {
              setIsLoading(false);
            },
            onRunErrorEvent: ({ event }) => {
              const errorMessage: ChatMessageType = {
                id: randomUUID(),
                text: `Sorry, I encountered an error: ${event.message}`,
                sender: "bot",
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, errorMessage]);
              resetStreamingState();
            },
          }
        );
      } catch (error) {
        const errorMessage: ChatMessageType = {
          id: randomUUID(),
          text: "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        resetStreamingState();
      }
    },
    [resetStreamingState]
  );

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h2 className="text-2xl font-semibold mb-2">
                Welcome to Chat Bot
              </h2>
              <p>Start a conversation by sending a message below.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {currentReasoning && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[80%] w-full">
                  <ReasoningAccordion
                    content={currentReasoning}
                    isExpanded={isReasoningExpanded}
                    onToggle={setIsReasoningExpanded}
                  />
                </div>
              </div>
            )}
            {currentMessage && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[80%]">
                  <MessageBubble text={currentMessage} isUser={false} />
                </div>
              </div>
            )}
            {isLoading && !currentReasoning && !currentMessage && (
              <div className="flex justify-start mb-4">
                <div className="rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 text-sm">Thinking...</span>
                    <ChevronRight className="size-4 text-gray-500" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
