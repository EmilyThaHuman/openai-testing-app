import StorageService from "archive/storage/localStorageService";
import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-3-small";

const openai = new OpenAI({
  apiKey: StorageService.items.get("openai_api_key"),
});

export async function generateEmbeddings(texts) {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      dimensions: 256,
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

export { generateEmbeddings };
