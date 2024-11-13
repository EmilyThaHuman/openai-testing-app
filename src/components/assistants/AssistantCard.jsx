import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Settings,
  MoreVertical,
  PlayCircle,
  Trash2,
  History,
  Share2,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const AssistantCard = ({
  assistant,
  onSelect,
  onDelete,
  onStartRun,
  onEdit,
  isSelected,
  isRunning,
}) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(assistant.name);
      toast({
        description: "Assistant name copied to clipboard",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to copy name",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card
        className={cn(
          "relative group transition-all duration-300 hover:shadow-lg",
          isSelected && "border-primary"
        )}
      >
        <CardHeader className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback>
                {assistant.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-xl">{assistant.name}</CardTitle>
              <CardDescription className="text-sm truncate max-w-[200px]">
                {assistant.instructions}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{assistant.model}</Badge>
            {assistant.tools?.map((tool) => (
              <Badge key={tool.type} variant="secondary">
                {tool.type}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-sm text-muted-foreground">
            Created {formatDistanceToNow(new Date(assistant.created_at), { addSuffix: true })}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => onStartRun(assistant)}
            disabled={isRunning || !isSelected}
          >
            <PlayCircle className="w-4 h-4" />
            Start Run
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(assistant)}>
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelect(assistant)}>
                <History className="w-4 h-4 mr-2" />
                View History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(assistant.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>

        {isSelected && (
          <motion.div
            layoutId="highlight"
            className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </Card>
    </motion.div>
  );
};

export default AssistantCard;