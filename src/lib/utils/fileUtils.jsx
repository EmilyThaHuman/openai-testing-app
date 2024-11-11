import { MAX_CHUNK_SIZE } from "@/constants/fileConstants";
import { chunk } from "lodash";

/**
 * Converts a file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} A promise that resolves with the base64 string
 */
export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Validates an image file for type and size
 * @param {File} file - The file to validate
 * @returns {boolean} Returns true if valid, throws error if invalid
 * @throws {Error} Throws error if file type or size is invalid
 */
export const validateImageFile = (file) => {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Please upload a JPEG, JPG, PNG, or GIF file."
    );
  }

  if (file.size > maxSize) {
    throw new Error("File size too large. Maximum size is 5MB.");
  }

  return true;
};

export const downloadFile = (data, filename) => {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  link.remove();
};

/**
 * Utility class for handling file operations including validation, chunking and uploads
 * @class FileHandler
 */
export class FileHandler {
  static async validateFile(file, options = {}) {
    const {
      maxSize = 100 * 1024 * 1024, // 100MB default
      allowedTypes = [
        "text/plain",
        "application/json",
        "image/png",
        "image/jpeg",
      ],
    } = options;

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
      );
    }

    if (file.size > maxSize) {
      throw new Error(
        `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
      );
    }

    return true;
  }

  static async uploadWithChunks(file, uploadFn, onProgress) {
    const chunks = await this.createChunks(file);
    let uploadedChunks = 0;

    for (const chunk of chunks) {
      await uploadFn(chunk);
      uploadedChunks++;
      onProgress?.(Math.round((uploadedChunks / chunks.length) * 100));
    }
  }

  static async createChunks(file) {
    const buffer = await file.arrayBuffer();
    return chunk(new Uint8Array(buffer), MAX_CHUNK_SIZE);
  }
}
