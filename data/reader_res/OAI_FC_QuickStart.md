Assistants Function Calling - OpenAI API
=============== 

R

reed\_tha\_human

/

ReedAi

[PlaygroundPlayground](https://platform.openai.com/playground)[DashboardDashboard](https://platform.openai.com/chat-completions)[DocsDocs](https://platform.openai.com/docs)[API referenceAPI](https://platform.openai.com/docs/api-reference/assistants)

[](https://platform.openai.com/settings)

R

SearchK

Get started

[Overview](https://platform.openai.com/docs/overview)[Quickstart](https://platform.openai.com/docs/quickstart)[Models](https://platform.openai.com/docs/models)[Changelog](https://platform.openai.com/docs/changelog)[Terms and policies](https://openai.com/policies)

Capabilities

[Text generation](https://platform.openai.com/docs/guides/text-generation)[Image generation](https://platform.openai.com/docs/guides/images)[Vision](https://platform.openai.com/docs/guides/vision)[Audio generation](https://platform.openai.com/docs/guides/audio)[Text to speech](https://platform.openai.com/docs/guides/text-to-speech)[Speech to text](https://platform.openai.com/docs/guides/speech-to-text)[Embeddings](https://platform.openai.com/docs/guides/embeddings)[Moderation](https://platform.openai.com/docs/guides/moderation)[Reasoning](https://platform.openai.com/docs/guides/reasoning)

Guides

[Function calling](https://platform.openai.com/docs/guides/function-calling)[Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)[Predicted Outputs](https://platform.openai.com/docs/guides/predicted-outputs)[Evaluations](https://platform.openai.com/docs/guides/evals)[Fine-tuning](https://platform.openai.com/docs/guides/fine-tuning)[Distillation](https://platform.openai.com/docs/guides/distillation)[Realtime API](https://platform.openai.com/docs/guides/realtime)[Batch API](https://platform.openai.com/docs/guides/batch)

Assistants

[Overview](https://platform.openai.com/docs/assistants/overview)[Quickstart](https://platform.openai.com/docs/assistants/quickstart)[Deep dive](https://platform.openai.com/docs/assistants/deep-dive)[Tools](https://platform.openai.com/docs/assistants/tools)

[File search](https://platform.openai.com/docs/assistants/tools/file-search)[Code interpreter](https://platform.openai.com/docs/assistants/tools/code-interpreter)[Function calling](https://platform.openai.com/docs/assistants/tools/function-calling)

[What's new?](https://platform.openai.com/docs/assistants/whats-new)[Migration guide](https://platform.openai.com/docs/assistants/migration)

ChatGPT

[Actions](https://platform.openai.com/docs/actions)[Release notes](https://platform.openai.com/docs/gpts/release-notes)

Best practices

[Prompt engineering](https://platform.openai.com/docs/guides/prompt-engineering)[Production best practices](https://platform.openai.com/docs/guides/production-best-practices)[Safety best practices](https://platform.openai.com/docs/guides/safety-best-practices)[Prompt Caching](https://platform.openai.com/docs/guides/prompt-caching)[Model selection](https://platform.openai.com/docs/guides/model-selection)[Latency optimization](https://platform.openai.com/docs/guides/latency-optimization)[Accuracy optimization](https://platform.openai.com/docs/guides/optimizing-llm-accuracy)[Advanced usage](https://platform.openai.com/docs/advanced-usage)

Resources

[Libraries](https://platform.openai.com/docs/libraries)[Prompt examples](https://platform.openai.com/docs/examples)[Rate limits](https://platform.openai.com/docs/guides/rate-limits)[Prompt generation](https://platform.openai.com/docs/guides/prompt-generation)[Error codes](https://platform.openai.com/docs/guides/error-codes)[Deprecations](https://platform.openai.com/docs/deprecations)

[Cookbook](https://cookbook.openai.com/)[Forum](https://community.openai.com/categories)Help

Assistants Function Calling

Beta


===================================

Similar to the Chat Completions API, the Assistants API supports function calling. Function calling allows you to describe functions to the Assistants API and have it intelligently return the functions that need to be called along with their arguments.

Quickstart
----------

In this example, we'll create a weather assistant and define two functions, `get_current_temperature` and `get_rain_probability`, as tools that the Assistant can call. Depending on the user query, the model will invoke parallel function calling if using our latest models released on or after Nov 6, 2023. In our example that uses parallel function calling, we will ask the Assistant what the weather in San Francisco is like today and the chances of rain. We also show how to output the Assistant's response with streaming.

With the launch of Structured Outputs, you can now use the parameter `strict: true` when using function calling with the Assistants API. For more information, refer to the [Function calling guide](https://platform.openai.com/docs/guides/function-calling#function-calling-with-structured-outputs). Please note that Structured Outputs are not supported in the Assistants API when using vision.

### Step 1: Define functions

When creating your assistant, you will first define the functions under the `tools` param of the assistant.

node.js

```javascript
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
const assistant = await client.beta.assistants.create({
  model: "gpt-4o",
  instructions:
    "You are a weather bot. Use the provided functions to answer questions.",
  tools: [
    {
      type: "function",
      function: {
        name: "getCurrentTemperature",
        description: "Get the current temperature for a specific location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g., San Francisco, CA",
            },
            unit: {
              type: "string",
              enum: ["Celsius", "Fahrenheit"],
              description:
                "The temperature unit to use. Infer this from the user's location.",
            },
          },
          required: ["location", "unit"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "getRainProbability",
        description: "Get the probability of rain for a specific location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g., San Francisco, CA",
            },
          },
          required: ["location"],
        },
      },
    },
  ],
});

Step 2: Create a Thread and add Messages

Create a Thread when a user starts a conversation and add Messages to the Thread as the user asks questions.

node.js

1
2
3
4
5
const thread = await client.beta.threads.create();
const message = client.beta.threads.messages.create(thread.id, {
  role: "user",
  content: "What's the weather in San Francisco today and the likelihood it'll rain?",
});

Step 3: Initiate a Run

When you initiate a Run on a Thread containing a user Message that triggers one or more functions, the Run will enter a pending status. After it processes, the run will enter a requires_action state which you can verify by checking the Run’s status. This indicates that you need to run tools and submit their outputs to the Assistant to continue Run execution. In our case, we will see two tool_calls, which indicates that the user query resulted in parallel function calling.

Note that a runs expire ten minutes after creation. Be sure to submit your tool outputs before the 10 min mark.

You will see two tool_calls within required_action, which indicates the user query triggered parallel function calling.

json

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
{
  "id": "run_qJL1kI9xxWlfE0z1yfL0fGg9",
  ...
  "status": "requires_action",
  "required_action": {
    "submit_tool_outputs": {
      "tool_calls": [
        {
          "id": "call_FthC9qRpsL5kBpwwyw6c7j4k",
          "function": {
            "arguments": "{"location": "San Francisco, CA"}",
            "name": "get_rain_probability"
          },
          "type": "function"
        },
        {
          "id": "call_RpEDoB8O0FTL9JoKTuCVFOyR",
          "function": {
            "arguments": "{"location": "San Francisco, CA", "unit": "Fahrenheit"}",
            "name": "get_current_temperature"
          },
          "type": "function"
        }
      ]
    },
    ...
    "type": "submit_tool_outputs"
  }
}


Run object truncated here for readability

How you initiate a Run and submit tool_calls will differ depending on whether you are using streaming or not, although in both cases all tool_calls need to be submitted at the same time. You can then complete the Run by submitting the tool outputs from the functions you called. Pass each tool_call_id referenced in the required_action object to match outputs to each function call.

With streamingWithout streaming

For the streaming case, we create an EventHandler class to handle events in the response stream and submit all tool outputs at once with the “submit tool outputs stream” helper in the Python and Node SDKs.

node.js

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
class EventHandler extends EventEmitter {
  constructor(client) {
    super();
    this.client = client;
  }

  async onEvent(event) {
    try {
      console.log(event);
      // Retrieve events that are denoted with 'requires_action'
      // since these will have our tool_calls
      if (event.event === "thread.run.requires_action") {
        await this.handleRequiresAction(
          event.data,
          event.data.id,
          event.data.thread_id,
        );
      }
    } catch (error) {
      console.error("Error handling event:", error);
    }
  }

  async handleRequiresAction(data, runId, threadId) {
    try {
      const toolOutputs =
        data.required_action.submit_tool_outputs.tool_calls.map((toolCall) => {
          if (toolCall.function.name === "getCurrentTemperature") {
            return {
              tool_call_id: toolCall.id,
              output: "57",
            };
          } else if (toolCall.function.name === "getRainProbability") {
            return {
              tool_call_id: toolCall.id,
              output: "0.06",
            };
          }
        });
      // Submit all the tool outputs at the same time
      await this.submitToolOutputs(toolOutputs, runId, threadId);
    } catch (error) {
      console.error("Error processing required action:", error);
    }
  }

  async submitToolOutputs(toolOutputs, runId, threadId) {
    try {
      // Use the submitToolOutputsStream helper
      const stream = this.client.beta.threads.runs.submitToolOutputsStream(
        threadId,
        runId,
        { tool_outputs: toolOutputs },
      );
      for await (const event of stream) {
        this.emit("event", event);
      }
    } catch (error) {
      console.error("Error submitting tool outputs:", error);
    }
  }
}

const eventHandler = new EventHandler(client);
eventHandler.on("event", eventHandler.onEvent.bind(eventHandler));

const stream = await client.beta.threads.runs.stream(
  threadId,
  { assistant_id: assistantId },
  eventHandler,
);

for await (const event of stream) {
  eventHandler.emit("event", event);
}

Using Structured Outputs

When you enable Structured Outputs by supplying strict: true, the OpenAI API will pre-process your supplied schema on your first request, and then use this artifact to constrain the model to your schema.

node.js

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
const assistant = await client.beta.assistants.create({
  model: "gpt-4o-2024-08-06",
  instructions:
    "You are a weather bot. Use the provided functions to answer questions.",
  tools: [
    {
      type: "function",
      function: {
        name: "getCurrentTemperature",
        description: "Get the current temperature for a specific location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g., San Francisco, CA",
            },
            unit: {
              type: "string",
              enum: ["Celsius", "Fahrenheit"],
              description:
                "The temperature unit to use. Infer this from the user's location.",
            },
          },
          required: ["location", "unit"],
          additionalProperties: false
        },
        strict: true
      },
    },
    {
      type: "function",
      function: {
        name: "getRainProbability",
        description: "Get the probability of rain for a specific location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g., San Francisco, CA",
            },
          },
          required: ["location"],
          additionalProperties: false
        },
        strict: true
      },
    },
  ],
});


Was this page useful?