// FileItem.js
import React from "react";
import PropTypes from "prop-types";
import { ExternalLink } from "lucide-react";

const FileItem = ({ icon: Icon, name, size = "h-4 w-4" }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Icon className={size} />
    <span>{name}</span>
    <ExternalLink />
  </div>
);

FileItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  name: PropTypes.string.isRequired,
  size: PropTypes.string
};

export default FileItem;
