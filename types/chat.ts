export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  thinking?: string;
}

export interface ChatResponse {
  reply: string;
  data?: unknown;
}

