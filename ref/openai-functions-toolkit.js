// src/utils/openai-functions-toolkit.js

import { openAIFunctions } from './openAIFunctions';

export class AIFunctions {
  constructor(message, options = {}) {
    this.message = message;
    this.options = options;
  }

  async call() {
    const { message, options } = this;
    let functionArray = options.functionArray;

    if (!functionArray) {
      console.log("No specific functions requested. Using all available functions.");
      functionArray = Object.keys(openAIFunctions);
    } else {
      console.log(`Requested functions: ${functionArray.join(", ")}`);
    }

    const functionMap = {};

    for (const functionName of functionArray) {
      if (Object.prototype.hasOwnProperty.call(openAIFunctions, functionName)) {
        functionMap[functionName] = openAIFunctions[functionName];
      } else {
        throw new Error(`Unsupported function: ${functionName}`);
      }
    }

    const baseURL = "https://api.openai.com/v1/chat/completions";
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + import.meta.env.VITE_OPENAI_API_KEY,
    };

    let data = {
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      model: "gpt-3.5-turbo-0613",
      functions: functionArray.map(
        (functionName) => openAIFunctions[functionName].details
      ),
      function_call: "auto",
    };

    try {
      console.log(`Sending initial request of "${message}" to OpenAI...`);
      let response = await fetch(baseURL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      response = await response.json();

      let executedFunctions = {};

      while (
        response.choices &&
        response.choices[0].message.function_call &&
        response.choices[0].finish_reason !== "stop"
      ) {
        let message = response.choices[0].message;
        const function_name = message.function_call.name;

        if (executedFunctions[function_name]) {
          break;
        }

        let function_response = "";

        if (Object.prototype.hasOwnProperty.call(functionMap, function_name)) {
          const functionArgs = JSON.parse(message.function_call.arguments);
          const functionToExecute = functionMap[function_name];

          function_response = await functionToExecute.execute(functionArgs);
        } else {
          throw new Error(`Unsupported function: ${function_name}`);
        }

        executedFunctions[function_name] = true;
        data.messages.push({
          role: "function",
          name: function_name,
          content: function_response,
        });

        response = await fetch(baseURL, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        response = await response.json();
      }

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error:", error);
    }
  }
}
