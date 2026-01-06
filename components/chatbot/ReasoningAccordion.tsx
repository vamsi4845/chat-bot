"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { ANSWER_MARKER } from "@/lib/constants";

interface ReasoningAccordionProps {
  content: string;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

export function ReasoningAccordion({
  content,
  defaultExpanded = false,
  isExpanded: controlledExpanded,
  onToggle,
}: ReasoningAccordionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  useEffect(() => {
    if (!isControlled && defaultExpanded !== undefined) {
      setInternalExpanded(defaultExpanded);
    }
  }, [defaultExpanded, isControlled]);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    if (isControlled) {
      onToggle?.(newExpanded);
    } else {
      setInternalExpanded(newExpanded);
    }
  };

  const cleanedContent = content.replace(ANSWER_MARKER, "");

  return (
    <div className="mb-2">
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 w-full text-left"
      >
        <span className="text-gray-900 text-sm">Thinking...</span>
        <span
          className={`text-gray-900 text-sm transition-transform ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          <ChevronRight className="size-4 text-gray-500" />
        </span>
      </button>
      {isExpanded && (
        <div className="mt-2 text-gray-900 text-sm whitespace-pre-wrap bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 w-full">
          {cleanedContent}
        </div>
      )}
    </div>
  );
}
