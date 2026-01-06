import { NextRequest } from "next/server";
import {
  AbstractAgent,
  RunAgentInput,
  EventType,
  BaseEvent,
  RunStartedEvent,
  RunFinishedEvent,
  TextMessageStartEvent,
  TextMessageContentEvent,
  TextMessageEndEvent,
} from "@ag-ui/client";
import { EventEncoder } from "@ag-ui/encoder";
import { Observable } from "rxjs";
import OpenAI from "openai";
import { ANSWER_MARKER_FULL, REASONING_PREFIX } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class ChatAgent extends AbstractAgent {
  run(input: RunAgentInput): Observable<BaseEvent> {
    return new Observable((observer) => {
      (async () => {
        try {
          observer.next({
            type: EventType.RUN_STARTED,
            threadId: input.threadId,
            runId: input.runId,
          } as RunStartedEvent);

          const reasoningId = `reasoning-${Date.now()}`;
          const reasoningMessageId = `reasoning-msg-${Date.now()}`;
          const messageId = `msg-${Date.now()}`;

          const convertMessageToOpenAI = (m: any) => {
            let role: "user" | "assistant" | "system" | "tool" = "user";

            if (m.role === "user" || m.role === "assistant" || m.role === "system" || m.role === "tool") {
              role = m.role;
            } else if (m.role === "developer") {
              role = "system";
            } else {
              role = "user";
            }

            let content: string = "";
            if (typeof m.content === "string") {
              content = m.content;
            } else if (Array.isArray(m.content)) {
              content = m.content
                .map((c: any) => (typeof c === "string" ? c : c.text || ""))
                .join("\n");
            } else if (m.content && typeof m.content === "object") {
              content = JSON.stringify(m.content);
            }

            const message: any = {
              role,
              content,
            };

            if (m.role === "tool" && m.toolCallId) {
              message.tool_call_id = m.toolCallId;
            }

            return message;
          };

          observer.next({
            type: EventType.THINKING_START,
            messageId: reasoningId,
          } as BaseEvent);

          observer.next({
            type: EventType.THINKING_TEXT_MESSAGE_START,
            messageId: reasoningMessageId,
            role: "assistant",
          } as BaseEvent);

          let reasoningComplete = false;
          let buffer = "";
          let skipUntilReasoning = true;

          const responseStream = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant. When answering, first think step by step about the question, then provide your answer. Format your response as:\n\nReasoning: [your step-by-step thinking]\n\nAnswer: [your final answer]"
              },
              ...input.messages
                .filter(m => m.role !== "activity")
                .map(convertMessageToOpenAI),
            ],
            stream: true,
          });

          for await (const chunk of responseStream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              buffer += delta;

              if (!reasoningComplete) {
                if (buffer.includes(ANSWER_MARKER_FULL)) {
                  const markerIndex = buffer.indexOf(ANSWER_MARKER_FULL);
                  const beforeMarker = buffer.substring(0, markerIndex);

                  if (skipUntilReasoning && beforeMarker.includes(REASONING_PREFIX)) {
                    const prefixIndex = beforeMarker.indexOf(REASONING_PREFIX);
                    const reasoningContent = beforeMarker.substring(prefixIndex + REASONING_PREFIX.length).trim();
                    if (reasoningContent) {
                      observer.next({
                        type: EventType.THINKING_TEXT_MESSAGE_CONTENT,
                        messageId: reasoningMessageId,
                        delta: reasoningContent,
                      } as BaseEvent);
                    }
                    skipUntilReasoning = false;
                  }

                  observer.next({
                    type: EventType.THINKING_TEXT_MESSAGE_END,
                    messageId: reasoningMessageId,
                  } as BaseEvent);

                  observer.next({
                    type: EventType.THINKING_END,
                    messageId: reasoningId,
                  } as BaseEvent);

                  observer.next({
                    type: EventType.TEXT_MESSAGE_START,
                    messageId,
                    role: "assistant",
                  } as TextMessageStartEvent);

                  reasoningComplete = true;
                  const answerStart = buffer.substring(markerIndex + ANSWER_MARKER_FULL.length).trim();

                  if (answerStart) {
                    observer.next({
                      type: EventType.TEXT_MESSAGE_CONTENT,
                      messageId,
                      delta: answerStart,
                    } as TextMessageContentEvent);
                  }

                  buffer = "";
                } else {
                  if (skipUntilReasoning) {
                    if (buffer.includes(REASONING_PREFIX)) {
                      const prefixIndex = buffer.indexOf(REASONING_PREFIX);
                      const afterPrefix = buffer.substring(prefixIndex + REASONING_PREFIX.length);
                      if (afterPrefix.trim()) {
                        observer.next({
                          type: EventType.THINKING_TEXT_MESSAGE_CONTENT,
                          messageId: reasoningMessageId,
                          delta: afterPrefix,
                        } as BaseEvent);
                      }
                      skipUntilReasoning = false;
                      buffer = afterPrefix;
                    }
                  } else {
                    observer.next({
                      type: EventType.THINKING_TEXT_MESSAGE_CONTENT,
                      messageId: reasoningMessageId,
                      delta,
                    } as BaseEvent);
                  }
                }
              } else {
                observer.next({
                  type: EventType.TEXT_MESSAGE_CONTENT,
                  messageId,
                  delta,
                } as TextMessageContentEvent);
              }
            }
          }

          if (!reasoningComplete) {
            observer.next({
              type: EventType.THINKING_TEXT_MESSAGE_END,
              messageId: reasoningMessageId,
            } as BaseEvent);

            observer.next({
              type: EventType.THINKING_END,
              messageId: reasoningId,
            } as BaseEvent);

            observer.next({
              type: EventType.TEXT_MESSAGE_START,
              messageId,
              role: "assistant",
            } as TextMessageStartEvent);
          }

          observer.next({
            type: EventType.TEXT_MESSAGE_END,
            messageId,
          } as TextMessageEndEvent);

          observer.next({
            type: EventType.RUN_FINISHED,
            threadId: input.threadId,
            runId: input.runId,
          } as RunFinishedEvent);

          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const input: RunAgentInput = await request.json();
    const acceptHeader = request.headers.get("accept") || "";

    const encoder = new EventEncoder({ accept: acceptHeader });
    const agent = new ChatAgent({ threadId: input.threadId });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          agent.run(input).subscribe({
            next: (event) => {
              const encoded = encoder.encode(event);
              controller.enqueue(new TextEncoder().encode(encoded));
            },
            error: (error) => {
              console.error("Agent error:", error);
              controller.error(error);
            },
            complete: () => {
              controller.close();
            },
          });
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": encoder.getContentType(),
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process message" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}