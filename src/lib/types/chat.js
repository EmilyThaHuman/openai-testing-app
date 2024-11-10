/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} role
 * @property {string|MessageContent[]} content
 * @property {string} [name]
 * @property {Function[]} [functions]
 * @property {string} [function_call]
 */

/**
 * @typedef {Object} MessageContent
 * @property {string} type
 * @property {string} text
 */

/**
 * @typedef {Object} ChatOptions
 * @property {string} model
 * @property {number} [temperature]
 * @property {number} [top_p]
 * @property {number} [max_tokens]
 * @property {boolean} [stream]
 * @property {Function[]} [functions]
 */

export const MessageRoles = {
  SYSTEM: "system",
  USER: "user",
  ASSISTANT: "assistant",
  FUNCTION: "function",
};
