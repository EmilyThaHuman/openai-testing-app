// useTextCompletion.js

import { useState } from "react";
import { createCompletion } from "./openaiRegularService";

export const useTextCompletion = () => {
  const [result, setResult] = useState("");

  const getTextCompletion = async (prompt, options = {}) => {
    const data = {
      prompt,
      model: options.model || "text-davinci-003",
      ...options,
    };

    try {
      const response = await createCompletion(data);
      setResult(response.choices[0].text);
      return response.choices[0].text;
    } catch (error) {
      console.error("Error in getTextCompletion:", error);
      throw error;
    }
  };

  return { result, getTextCompletion };
};
