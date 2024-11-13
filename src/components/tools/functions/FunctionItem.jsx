// FunctionItem.js
import React from "react";
import PropTypes from "prop-types";
import { Settings } from "lucide-react";
export const FunctionItem = ({ name }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Settings />
    <span className="font-mono">{name}</span>
  </div>
);

FunctionItem.propTypes = {
  name: PropTypes.string.isRequired
};

export default FunctionItem;
