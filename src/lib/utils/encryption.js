import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'fallback-key';

export const encrypt = (data) => {
  try {
    const stringData = JSON.stringify(data);
    return CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    // Return original data if encryption fails
    return data;
  }
};

export const decrypt = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
      throw new Error("Decryption resulted in empty string");
    }
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption failed:", error);
    // Return the encrypted data as-is if decryption fails
    return encryptedData;
  }
};
