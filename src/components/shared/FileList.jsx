import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropTypes from 'prop-types';

export const FileList = ({ files, onRemove }) => {
  if (!files?.length) return null;

  return (
    <div className="space-y-2">
      {files.map(fileId => (
        <div 
          key={fileId}
          className="flex items-center justify-between p-2 bg-secondary rounded"
        >
          <span className="truncate">{fileId}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(fileId)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

FileList.propTypes = {
  files: PropTypes.arrayOf(PropTypes.string),
  onRemove: PropTypes.func.isRequired
};