import { HttpAgent } from "@ag-ui/client";

export function createAgent(threadId?: string) {
  return new HttpAgent({
    url: process.env.AGUI_API_URL || "/api/chat",
    threadId: threadId || `thread-${Date.now()}`,
  });
}

