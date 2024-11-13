import React, { useEffect, useState, useMemo } from "react";
import * as monaco from "monaco-editor";
import Editor from "@monaco-editor/react";
import { useContentPart } from "@assistant-ui/react";
import { CornerDownRightIcon } from "lucide-react";
import { tryJsonParse } from "@/lib/utils/tryJsonParse";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const monacoOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  lineNumbers: "off",
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
  renderValidationDecorations: "on",
  automaticLayout: true,
  padding: { top: 8, bottom: 8 },
  wordWrap: "on",
};

const RemoveContentPartButton = ({ onRemove }) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onRemove}
    className="text-muted-foreground hover:text-destructive"
  >
    Remove
  </Button>
);

const MonacoEditor = ({
  value,
  onChange,
  language = "json",
  height = "120px",
}) => (
  <Editor
    height={height}
    defaultLanguage={language}
    value={value}
    onChange={onChange}
    options={monacoOptions}
    className="border rounded-md bg-background"
    beforeMount={(monaco) => {
      monaco.editor.defineTheme("customTheme", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#1e1e1e",
        },
      });
      monaco.editor.setTheme("customTheme");
    }}
  />
);

export const ToolUI = ({ toolName, onRemove }) => {
  const part = useContentPart();
  const [argsValue, setArgsValue] = useState("");
  const [resultValue, setResultValue] = useState("");

  // Format initial values
  useEffect(() => {
    setArgsValue(part.argsText ?? JSON.stringify(part.args, null, 2));
    setResultValue(
      !part.result
        ? ""
        : typeof part.result === "string"
          ? part.result
          : JSON.stringify(part.result, null, 2),
    );
  }, [part]);

  // Memoize handlers to prevent unnecessary rerenders
  const handleArgsChange = useMemo(
    () => (value) => {
      setArgsValue(value);
      part.argsText = value;
      part.args = tryJsonParse(value);
    },
    [part],
  );

  const handleResultChange = useMemo(
    () => (value) => {
      setResultValue(value);
      part.result = value;
    },
    [part],
  );

  return (
    <Card className="p-4 space-y-4 bg-muted/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Tool:</span>
          <code className="px-2 py-1 bg-muted rounded text-sm">{toolName}</code>
        </div>
        <RemoveContentPartButton onRemove={onRemove} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Arguments</label>
        <MonacoEditor value={argsValue} onChange={handleArgsChange} />
      </div>

      <div className="border-t border-dashed my-4" />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CornerDownRightIcon className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">Result</label>
        </div>
        <MonacoEditor value={resultValue} onChange={handleResultChange} />
      </div>
    </Card>
  );
};

// Export named components for better code organization
export const ToolArgumentsEditor = React.memo(({ value, onChange }) => (
  <MonacoEditor value={value} onChange={onChange} />
));

export const ToolResultEditor = React.memo(({ value, onChange }) => (
  <MonacoEditor value={value} onChange={onChange} />
));
