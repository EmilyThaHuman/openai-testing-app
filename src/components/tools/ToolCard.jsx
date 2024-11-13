// ToolCard.js
import React from "react";
import PropTypes from "prop-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export const ToolCard = ({
  title,
  enabled,
  onToggle,
  tooltipContent,
  buttonText,
  buttonIcon: ButtonIcon,
  children
}) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Switch checked={enabled} onCheckedChange={onToggle} />
        <span className="font-medium">{title}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info />
            </TooltipTrigger>
            <TooltipContent>{tooltipContent}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Button variant="outline" size="sm">
        <ButtonIcon />
        <span className="ml-2">{buttonText}</span>
      </Button>
    </div>
    <div className="mt-4">{children}</div>
  </Card>
);

ToolCard.propTypes = {
  title: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  tooltipContent: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  buttonIcon: PropTypes.elementType.isRequired,
  children: PropTypes.node
};

export default ToolCard;
