import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

const AssistantCard = React.memo(
  ({ assistant, isSelected, onSelect, onStartRun, isRunning }) => (
    <Card
      className={`p-4 hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-gray-100" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex-grow cursor-pointer"
          onClick={() => onSelect(assistant)}
        >
          <h3 className="font-medium">{assistant.name}</h3>
          <p className="text-sm text-gray-500">{assistant.id}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-2"
          onClick={() => onStartRun(assistant)}
          disabled={isRunning || !isSelected}
        >
          <PlayCircle className="h-4 w-4 mr-1" />
          Start Run
        </Button>
      </div>
    </Card>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.assistant.id === nextProps.assistant.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isRunning === nextProps.isRunning
    );
  }
);

const AssistantList = ({
  assistants,
  selectedAssistant,
  onAssistantSelect,
  onStartRun,
  isRunning,
  loading,
}) => {
  if (loading) {
    return (
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Assistants List</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const assistantArray = Array.isArray(assistants) ? assistants : [];

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Assistants List</h2>
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {assistantArray.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No assistants available
            </div>
          ) : (
            assistantArray.map((assistant) => (
              <AssistantCard
                key={assistant.id}
                assistant={assistant}
                isSelected={selectedAssistant?.id === assistant.id}
                onSelect={onAssistantSelect}
                onStartRun={onStartRun}
                isRunning={isRunning}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default AssistantList;
