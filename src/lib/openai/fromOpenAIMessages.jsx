import {
  LanguageModelV1Prompt,
  LanguageModelV1TextPart,
  LanguageModelV1ToolCallPart,
} from "@ai-sdk/provider";
import OpenAI from "openai";
import { tryJsonParse } from "./tryJsonParse";

export const fromOpenAIMessages = (
  messages,
  options = {},
) => {
  const lmMessages = [];
  const toolNames = new Map();

  for (const message of messages) {
    const { role, content } = message;
    switch (role) {
      case "system": {
        lmMessages.push({
          role: "system",
          content:
            typeof content === "string"
              ? content
              : content.map((c) => c.text).join("\n"),
        });
        break;
      }

      case "user": {
        lmMessages.push({
          role: "user",
          content:
            typeof content === "string"
              ? [{ type: "text", text: content }]
              : content
                  .map((part) => {
                    const type = part.type;
                    switch (type) {
                      case "text": {
                        return part;
                      }
                      case "image_url": {
                        return {
                          type: "image",
                          image: new URL(part.image_url.url),
                          // detail: part.image_url.detail,
                        };
                      }

                      default: {
                        const unsupportedPart = type;
                        if (options?.strict) {
                          throw new Error(
                            `Unsupported part: ${unsupportedPart}`,
                          );
                        }
                        return null;
                      }
                    }
                  })
                  .filter((part) => !!part),
        });
        break;
      }

      case "assistant": {
        const lmContent = [];

        if (content != null) {
          lmContent.push(
            ...(typeof content === "string"
              ? [{ type: "text", text: content }]
              : content.map((part) => {
                  const type = part.type;
                  switch (type) {
                    case "text": {
                      return part;
                    }

                    case "refusal": {
                      // TODO handle refusals
                      return {
                        type: "text",
                        text: part.refusal,
                      };
                    }

                    default: {
                      const unsupportedPart = type;
                      if (options?.strict) {
                        throw new Error(`Unsupported part: ${unsupportedPart}`);
                      }
                      return null;
                    }
                  }
                })
            ).filter((part) => !!part),
          );
        }

        if (message.tool_calls) {
          for (const toolCall of message.tool_calls) {
            switch (toolCall.type) {
              case "function": {
                lmContent.push({
                  type: "tool-call",
                  toolCallId: toolCall.id,
                  toolName: toolCall.function.name,
                  args: tryJsonParse(toolCall.function.arguments),
                });
                toolNames.set(toolCall.id, toolCall.function.name);
                break;
              }
              default: {
                const _exhaustiveCheck = toolCall.type;
                if (options?.strict) {
                  throw new Error(
                    `Unsupported tool call type: ${_exhaustiveCheck}`,
                  );
                }
                break;
              }
            }
          }
        }

        // TODO handle function_call?
        if (message.function_call && options?.strict)
          throw new Error("Function call is not supported");

        lmMessages.push({
          role: "assistant",
          content: lmContent,
        });
        break;
      }

      case "tool": {
        let toolMessage = lmMessages.at(-1);
        if (toolMessage?.role !== "tool") {
          toolMessage = {
            role: "tool",
            content: [],
          };
          lmMessages.push(toolMessage);
        }

        const toolName = toolNames.get(message.tool_call_id);
        if (!toolName) {
          if (options?.strict)
            throw new Error("Encountered unknown tool call id");
          break;
        }

        toolMessage.content.push({
          type: "tool-result",
          toolCallId: message.tool_call_id,
          toolName,
          result: message.content,
        });
        break;
      }

      default: {
        const unsupportedRole = role;
        if (options?.strict) {
          throw new Error(`Unsupported role: ${unsupportedRole}`);
        }
        break;
      }
    }
  }
  return lmMessages;
};