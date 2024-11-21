export const types = ["GPT-3", "Codex", "GPT-4", "GPT-4 Turbo", "DALL-E", "Whisper", "o1"];

/**
 * @typedef {typeof types[number]} ModelType
 */

/**
 * @typedef {Object} Model
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} [strengths]
 */

export const models = [
  {
    id: "c305f976-8e38-42b1-9fb7-d21b2e34f0da",
    name: "text-davinci-003",
    description:
      "Most capable GPT-3 model. Can do any task the other models can do, often with higher quality, longer output, and better instruction-following. Also supports inserting completions within text.",
    type: "GPT-3",
    strengths:
      "Complex intent, cause and effect, creative generation, search, summarization for audience",
  },
  {
    id: "464a47c3-7ab5-44d7-b669-f9cb5a9e8465",
    name: "text-curie-001",
    description: "Very capable, but faster and lower cost than Davinci.",
    type: "GPT-3",
    strengths:
      "Language translation, complex classification, sentiment, summarization",
  },
  {
    id: "ac0797b0-7e31-43b6-a494-da7e2ab43445",
    name: "text-babbage-001",
    description: "Capable of straightforward tasks, very fast, and lower cost.",
    type: "GPT-3",
    strengths: "Moderate classification, semantic search",
  },
  {
    id: "be638fb1-973b-4471-a49c-290325085802",
    name: "text-ada-001",
    description:
      "Capable of very simple tasks, usually the fastest model in the GPT-3 series, and lowest cost.",
    type: "GPT-3",
    strengths:
      "Parsing text, simple classification, address correction, keywords",
  },
  {
    id: "b43c0ea9-5ad4-456a-ae29-26cd77b6d0fb",
    name: "code-davinci-002",
    description:
      "Most capable Codex model. Particularly good at translating natural language to code. In addition to completing code, also supports inserting completions within code.",
    type: "Codex",
  },
  {
    id: "bbd57291-4622-4a21-9eed-dd6bd786fdd1",
    name: "code-cushman-001",
    description:
      "Almost as capable as Davinci Codex, but slightly faster. This speed advantage may make it preferable for real-time applications.",
    type: "Codex",
    strengths: "Real-time application where low-latency is preferable",
  },
  {
    id: "d1e2f3g4-h5i6-7j8k-9l0m-n1o2p3q4r5s6",
    name: "gpt-4",
    description:
      "OpenAI’s most advanced system, producing safer and more useful responses.",
    type: "GPT-4",
    strengths:
      "Advanced reasoning, complex problem-solving, understanding nuanced prompts",
  },
  {
    id: "t1u2v3w4-x5y6-7z8a-9b0c-d1e2f3g4h5i6",
    name: "gpt-4-turbo",
    description:
      "A variant of GPT-4 optimized for speed and cost, suitable for real-time applications.",
    type: "GPT-4 Turbo",
    strengths: "Faster response times, cost-effective, suitable for high-volume tasks",
  },
  {
    id: "j1k2l3m4-n5o6-7p8q-9r0s-t1u2v3w4x5y6",
    name: "dall-e-2",
    description:
      "Generates original, realistic images and art from a text description.",
    type: "DALL-E",
    strengths: "Image generation, creative visual content creation",
  },
  {
    id: "z1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6",
    name: "whisper-1",
    description:
      "A general-purpose speech recognition model that can transcribe audio into text.",
    type: "Whisper",
    strengths: "Speech-to-text transcription, multilingual support",
  },
  {
    id: "p1q2r3s4-t5u6-7v8w-9x0y-z1a2b3c4d5e6",
    name: "o1-preview",
    description:
      "A model designed to spend more time thinking before responding, leading to higher accuracy in complex tasks.",
    type: "o1",
    strengths: "Advanced reasoning, complex problem-solving, especially in science, coding, and math",
  },
  {
    id: "f1g2h3i4-j5k6-7l8m-9n0o-p1q2r3s4t5u6",
    name: "o1-mini",
    description:
      "A smaller, cost-effective version of the o1 model, excelling at STEM tasks.",
    type: "o1",
    strengths: "Efficient reasoning, particularly in math and coding, suitable for applications requiring reasoning without broad world knowledge",
  },
];

export default models;
