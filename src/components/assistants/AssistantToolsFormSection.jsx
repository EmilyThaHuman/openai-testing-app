import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PropTypes from "prop-types";

// Custom SVG Icons
const Icons = {
  Info: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  File: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Plus: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Code: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  ExternalLink: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Settings: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
};

const FILES_LIST = [
  { name: "useStore.js", icon: Icons.File },
  { name: "assistantSlice.js", icon: Icons.File },
  { name: "chat.js", icon: Icons.File },
  { name: "generateEmbeddings.js", icon: Icons.File },
  { name: "chatSlice.js", icon: Icons.File },
  { name: "toolsSlice.js", icon: Icons.File },
];

const FUNCTIONS_LIST = [
  "code_analysis",
  "generate_code_scaffolding",
  "generate_code_improvements",
  "enhance_documentation",
  "generate_test_functions",
  "api_integration_functions",
  "file_operations",
  "optimize_development_workflow",
];

const AssistantSettingsUI = () => {
  const [fileSearchEnabled, setFileSearchEnabled] = useState(true);
  const [codeInterpreterEnabled, setCodeInterpreterEnabled] = useState(true);

  return (
    <div className="space-y-6 p-4">
      {/* Tools Section */}
      <div className="space-y-4">
        <div className="text-sm font-semibold uppercase text-muted-foreground">
          TOOLS
        </div>

        {/* File Search Tool */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch 
                checked={fileSearchEnabled}
                onCheckedChange={setFileSearchEnabled}
              />
              <span className="font-medium">File search</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icons.Info />
                  </TooltipTrigger>
                  <TooltipContent>
                    Enable file search capabilities
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button variant="outline" size="sm">
              <Icons.Plus />
              <span className="ml-2">Files</span>
            </Button>
          </div>

          {/* File List */}
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Icons.File />
              <span>Untitled storage</span>
              <span className="ml-auto">0 KB</span>
            </div>
          </div>
        </Card>

        {/* Code Interpreter Tool */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch 
                checked={codeInterpreterEnabled}
                onCheckedChange={setCodeInterpreterEnabled}
              />
              <span className="font-medium">Code interpreter</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icons.Info />
                  </TooltipTrigger>
                  <TooltipContent>
                    Enable code interpretation
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button variant="outline" size="sm">
              <Icons.Plus />
              <span className="ml-2">Files</span>
            </Button>
          </div>

          {/* Code Files List */}
          {FILES_LIST.map((file, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <file.icon />
              <span>{file.name}</span>
              <Icons.ExternalLink />
            </div>
          ))}
        </Card>

        {/* Functions Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold uppercase text-muted-foreground">Functions</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icons.Info />
                  </TooltipTrigger>
                  <TooltipContent>
                    Available functions for the assistant
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button variant="outline" size="sm">
              <Icons.Plus />
              <span className="ml-2">Functions</span>
            </Button>
          </div>

          {/* Functions List */}
          <div className="space-y-2">
            {FUNCTIONS_LIST.map((func, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icons.Settings />
                <span className="font-mono">{func}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add PropTypes validation
AssistantSettingsUI.propTypes = {
  fileSearchEnabled: PropTypes.bool,
  setFileSearchEnabled: PropTypes.func,
  codeInterpreterEnabled: PropTypes.bool,
  setCodeInterpreterEnabled: PropTypes.func
};

export default AssistantSettingsUI;