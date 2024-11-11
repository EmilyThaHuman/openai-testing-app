// schemaValidator.js

import * as Yup from "yup";
import { MODELS, TOOLS, FUNCTIONS } from "@/lib/constants/assistantConstants";

// Define the schema for the assistant configuration
export const assistantSchema = Yup.object().shape({
  name: Yup.string().required("Assistant name is required"),
  instructions: Yup.string().required("Instructions are required"),
  model: Yup.string()
    .oneOf(Object.keys(MODELS), "Invalid model selected")
    .required("Model is required"),
  tools: Yup.array()
    .of(Yup.string().oneOf(Object.keys(TOOLS), "Invalid tool selected"))
    .default([]),
  functions: Yup.array()
    .of(Yup.string().oneOf(Object.keys(FUNCTIONS), "Invalid function selected"))
    .default([]),
  file_ids: Yup.array().of(Yup.string()),
  metadata: Yup.object(),
  temperature: Yup.number()
    .min(0, "Temperature must be at least 0")
    .max(1, "Temperature cannot exceed 1")
    .default(0.7),
  top_p: Yup.number()
    .min(0, "Top_p must be at least 0")
    .max(1, "Top_p cannot exceed 1")
    .default(1),
  presence_penalty: Yup.number()
    .min(-2, "Presence penalty must be at least -2")
    .max(2, "Presence penalty cannot exceed 2")
    .default(0),
  frequency_penalty: Yup.number()
    .min(-2, "Frequency penalty must be at least -2")
    .max(2, "Frequency penalty cannot exceed 2")
    .default(0),
  response_format: Yup.object()
    .shape({
      type: Yup.string()
        .oneOf(["text", "markdown", "json"], "Invalid response format type")
        .required("Response format type is required"),
      // Add more response format validations if necessary
    })
    .required("Response format is required"),
  file_search_enabled: Yup.boolean().default(false),
  code_interpreter_enabled: Yup.boolean().default(false),
  function_calling_enabled: Yup.boolean().default(false),
});

// Function to validate assistant configuration
export const validateAssistantConfig = async (assistantConfig) => {
  try {
    const validatedConfig = await assistantSchema.validate(assistantConfig, {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown keys
    });
    return { valid: true, data: validatedConfig };
  } catch (validationError) {
    return {
      valid: false,
      errors: validationError.inner.map((err) => ({
        path: err.path,
        message: err.message,
      })),
    };
  }
};
