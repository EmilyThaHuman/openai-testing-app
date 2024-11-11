import { useState, useEffect } from "react";
import { encrypt, decrypt } from "@/lib/utils/encryption";

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      try {
        // Attempt to parse as encrypted data
        return decrypt(JSON.parse(item));
      } catch (decryptError) {
        // If decryption fails, try parsing as plain JSON
        try {
          return JSON.parse(item);
        } catch (parseError) {
          // If both attempts fail, return the raw item or initial value
          return item || initialValue;
        }
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      try {
        // Attempt to encrypt and store
        window.localStorage.setItem(
          key,
          JSON.stringify(encrypt(valueToStore))
        );
      } catch (encryptError) {
        // Fallback to storing without encryption
        window.localStorage.setItem(
          key,
          JSON.stringify(valueToStore)
        );
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  return [storedValue, setValue];
}
