"use client";

import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { ArrowUp } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState<string>("");

  const handleSubmit = async () => {
    if (input.trim() && !isLoading) {
      await onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="w-full  p-4 bg-white">
      <PromptInput
        value={input}
        onValueChange={setInput}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        className="bg-white border-gray-300 focus-within:border-gray-400 rounded-xl"
      >
        <PromptInputTextarea
          placeholder="Type your message..."
          className="text-gray-900 placeholder:text-gray-500"
        />
        <PromptInputActions className="justify-end pt-2">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="h-8 w-8 rounded-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 text-white transition-colors flex items-center justify-center disabled:cursor-not-allowed"
          >
            <ArrowUp />
          </button>
        </PromptInputActions>
      </PromptInput>
    </div>
  );
}
