import { useState, useEffect } from "react";
import { encrypt, decrypt } from "@/utils/encryption";

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const decrypted = decrypt(item);
      return decrypted !== null ? decrypted : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (storedValue === undefined) {
        window.localStorage.removeItem(key);
      } else {
        const encrypted = encrypt(storedValue);
        window.localStorage.setItem(key, encrypted);
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
