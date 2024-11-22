import { META_PROMPT, META_PROMPT_WITH_REASONING } from "../constants/prompts";
import OpenAI from "openai";

let openaiInstance = null;

const checkInitialization = () => {
  if (!openaiInstance) {
    throw new Error(
      "OpenAI not initialized. Call initialize with API key first."
    );
  }
  return openaiInstance;
};

const initialize = (apiKey) => {
  if (!apiKey) return;
  openaiInstance = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
};

export async function generatePrompt(taskOrPrompt) {
  try {
    const openai = checkInitialization();
    const completion = await openai.createChatCompletion({
      model: "gpt-4", // Use the appropriate model
      messages: [
        { role: "system", content: META_PROMPT },
        {
          role: "user",
          content: "Task, Goal, or Current Prompt:\n" + taskOrPrompt,
        },
      ],
    });

    return completion.data.choices[0].message?.content || "";
  } catch (error) {
    console.error("Error generating prompt:", error);
    return "";
  }
}

export async function generatePromptWithReasoning(taskOrPrompt) {
  try {
    const openai = checkInitialization();
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: META_PROMPT_WITH_REASONING },
        {
          role: "user",
          content: "Task, Goal, or Current Prompt:\n" + taskOrPrompt,
        },
      ],
    });

    return completion.data.choices[0].message?.content || "";
  } catch (error) {
    console.error("Error generating prompt with reasoning:", error);
    return "";
  }
}
