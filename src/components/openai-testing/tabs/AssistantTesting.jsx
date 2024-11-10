import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService';
import { useOpenAI } from '@/context/OpenAIContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";

const MODELS = {
  'gpt-4-turbo-preview': 'GPT-4 Turbo',
  'gpt-4': 'GPT-4',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo'
};

const TOOLS = {
  code_interpreter: "Code Interpreter",
  retrieval: "File Search & Retrieval",
  function: "Function Calling"
};

export default function AssistantTesting() {
  const { apiKey } = useOpenAI();
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newAssistant, setNewAssistant] = useState({
    name: '',
    instructions: '',
    model: 'gpt-4-turbo-preview',
    tools: [],
    file_ids: [],
    metadata: {},
    temperature: 0.7,
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    response_format: { type: "text" },
  });
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState(new Set());
  const [threadMessages, setThreadMessages] = useState({});
  const [streaming, setStreaming] = useState(false);
  const [streamingMessages, setStreamingMessages] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    if (apiKey) {
      UnifiedOpenAIService.initialize(apiKey);
      fetchAssistants();
    }
  }, [apiKey]);

  useEffect(() => {
    if (selectedAssistant) {
      fetchThreads();
    }
  }, [selectedAssistant]);

  const fetchAssistants = async () => {
    try {
      const response = await UnifiedOpenAIService.assistants.list();
      setAssistants(response.data);
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  };

  const fetchThreads = async () => {
    try {
      const response = await UnifiedOpenAIService.threads.list();
      setThreads(response.data);
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  const createAssistant = async () => {
    if (!newAssistant.name || !newAssistant.model) {
      toast({
        title: "Error",
        description: "Name and model are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formattedTools = newAssistant.tools.map(tool => ({ type: tool }));

      const assistantData = {
        name: newAssistant.name.trim(),
        instructions: newAssistant.instructions.trim(),
        model: newAssistant.model,
        tools: formattedTools,
        file_ids: newAssistant.file_ids,
        metadata: newAssistant.metadata,
      };

      if (newAssistant.temperature !== 0.7) {
        assistantData.temperature = newAssistant.temperature;
      }
      if (newAssistant.top_p !== 1) {
        assistantData.top_p = newAssistant.top_p;
      }
      if (newAssistant.presence_penalty !== 0) {
        assistantData.presence_penalty = newAssistant.presence_penalty;
      }
      if (newAssistant.frequency_penalty !== 0) {
        assistantData.frequency_penalty = newAssistant.frequency_penalty;
      }
      if (newAssistant.response_format.type !== "text") {
        assistantData.response_format = newAssistant.response_format;
      }

      const assistant = await UnifiedOpenAIService.assistants.create(assistantData);
      
      setAssistants(prev => [...prev, assistant]);
      setNewAssistant({
        name: '',
        instructions: '',
        model: 'gpt-4-turbo-preview',
        tools: [],
        file_ids: [],
        metadata: {},
        temperature: 0.7,
        top_p: 1,
        presence_penalty: 0,
        frequency_penalty: 0,
        response_format: { type: "text" },
      });

      toast({
        title: "Success",
        description: "Assistant created successfully",
      });

    } catch (error) {
      console.error('Error creating assistant:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createThread = async () => {
    if (!selectedAssistant) return;
    setLoading(true);
    try {
      const thread = await UnifiedOpenAIService.threads.create();
      setThreads([...threads, thread]);
    } catch (error) {
      console.error('Error creating thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleThread = async (threadId) => {
    const newExpanded = new Set(expandedThreads);
    
    if (expandedThreads.has(threadId)) {
      newExpanded.delete(threadId);
    } else {
      newExpanded.add(threadId);
      // Fetch messages if not already loaded
      if (!threadMessages[threadId]) {
        await fetchThreadMessages(threadId);
      }
    }
    
    setExpandedThreads(newExpanded);
  };

  const fetchThreadMessages = async (threadId) => {
    try {
      const messages = await UnifiedOpenAIService.threads.messages.list(threadId);
      setThreadMessages(prev => ({
        ...prev,
        [threadId]: messages.data
      }));
    } catch (error) {
      console.error('Error fetching thread messages:', error);
    }
  };

  const sendMessage = async (threadId) => {
    if (!newMessage.trim() || loading) return;
    setLoading(true);
    
    try {
      const messageResponse = await UnifiedOpenAIService.threads.messages.create(
        threadId, 
        newMessage
      );
      console.log(messageResponse);
      
      const run = await UnifiedOpenAIService.threads.runs.create(
        threadId, 
        selectedAssistant.id,
        { stream: streaming }
      );

      if (streaming) {
        const stream = await UnifiedOpenAIService.threads.runs.getStream(
          threadId,
          run.id
        );

        for await (const chunk of stream) {
          if (chunk.choices?.[0]?.delta?.content) {
            setStreamingMessages(prev => ({
              ...prev,
              [threadId]: (prev[threadId] || '') + chunk.choices[0].delta.content
            }));
          }
        }
      }

      setNewMessage('');
      await fetchThreadMessages(threadId);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTool = (tool) => {
    setNewAssistant(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Create Assistant</h2>
        <div className="space-y-4">
          <Input
            placeholder="Assistant Name"
            value={newAssistant.name}
            onChange={(e) => setNewAssistant(prev => ({ ...prev, name: e.target.value }))}
          />
          
          <Textarea
            placeholder="Instructions"
            value={newAssistant.instructions}
            onChange={(e) => setNewAssistant(prev => ({ ...prev, instructions: e.target.value }))}
          />

          <div className="space-y-2">
            <Label>Model</Label>
            <Select 
              value={newAssistant.model}
              onValueChange={(value) => setNewAssistant(prev => ({ ...prev, model: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MODELS).map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tools</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TOOLS).map(([id, name]) => (
                <Badge
                  key={id}
                  variant={newAssistant.tools.includes(id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTool(id)}
                >
                  {name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Temperature: {newAssistant.temperature}</Label>
            <Slider
              value={[newAssistant.temperature]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={([value]) => setNewAssistant(prev => ({ ...prev, temperature: value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Top P: {newAssistant.top_p}</Label>
            <Slider
              value={[newAssistant.top_p]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => setNewAssistant(prev => ({ ...prev, top_p: value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Response Format</Label>
            <Select 
              value={newAssistant.response_format.type}
              onValueChange={(value) => setNewAssistant(prev => ({ 
                ...prev, 
                response_format: { type: value } 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="json_object">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={createAssistant} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Assistant'}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Assistants List</h2>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {assistants.map((assistant) => (
              <Card 
                key={assistant.id} 
                className={`p-2 cursor-pointer hover:bg-gray-100 ${
                  selectedAssistant?.id === assistant.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => setSelectedAssistant(assistant)}
              >
                <h3 className="font-medium">{assistant.name}</h3>
                <p className="text-sm text-gray-500">{assistant.id}</p>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Threads</h2>
          <Button 
            onClick={createThread} 
            disabled={!selectedAssistant || loading}
            size="sm"
          >
            New Thread
          </Button>
        </div>
        <ScrollArea className="h-[600px]">
          <Accordion
            type="multiple"
            value={Array.from(expandedThreads)}
            onValueChange={(value) => setExpandedThreads(new Set(value))}
          >
            {threads.map((thread) => (
              <AccordionItem key={thread.id} value={thread.id}>
                <AccordionTrigger className="hover:bg-accent hover:no-underline">
                  <div className="flex flex-col items-start">
                    <p className="text-sm">{thread.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(thread.created_at).toLocaleString()}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <ScrollArea className="h-[200px] w-full">
                      <div className="space-y-2 p-2">
                        {threadMessages[thread.id]?.map((message) => (
                          <Card key={message.id} className="p-2">
                            <p className="text-sm font-medium">{message.role}</p>
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content[0]?.text?.value}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(message.created_at).toLocaleString()}
                            </p>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={loading}
                      />
                      <Button 
                        onClick={() => sendMessage(thread.id)} 
                        disabled={loading || !newMessage.trim()}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </Card>
    </div>
  );
} 