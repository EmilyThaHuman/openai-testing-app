import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";

const GENERATOR_TYPES = {
  SYSTEM: "system",
  FUNCTIONS: "functions",
  ASSISTANT: "assistant",
};

const SYSTEM_PROMPTS = {
  [GENERATOR_TYPES.SYSTEM]: `You are a helpful assistant that generates system messages for AI models. 
Generate clear, detailed system messages that define the AI's role, capabilities, and constraints based on the user's description.`,

  [GENERATOR_TYPES.FUNCTIONS]: `You are a function definition generator for AI models.
Generate clear, detailed function definitions in JSON format that specify available tools and their parameters based on the user's requirements.
Always return valid JSON that follows the OpenAI function calling format.`,

  [GENERATOR_TYPES.ASSISTANT]: `You are an expert at creating assistant instructions.
Generate clear, detailed instructions that define the assistant's personality, tone, knowledge areas, and interaction style based on the user's requirements.
Focus on creating engaging and effective assistant personas.`,
};

export const generateInstructions = async ({
  type = GENERATOR_TYPES.SYSTEM,
  description,
  apiKey,
  onSuccess,
  onError,
  onStart,
  onComplete,
}) => {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  if (!description?.trim()) {
    throw new Error("Description is required");
  }

  try {
    onStart?.();

    const response = await UnifiedOpenAIService.chat.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPTS[type],
        },
        {
          role: "user",
          content: `Generate ${type} instructions for an AI with these requirements: ${description}`,
        },
      ],
    });

    const generatedContent = response.choices[0].message.content;

    // Parse JSON if generating functions
    const result =
      type === GENERATOR_TYPES.FUNCTIONS
        ? JSON.parse(generatedContent)
        : generatedContent;

    onSuccess?.(result);
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : `Failed to generate ${type} instructions`;

    onError?.(errorMessage);
    throw error;
  } finally {
    onComplete?.();
  }
};

export { GENERATOR_TYPES };
