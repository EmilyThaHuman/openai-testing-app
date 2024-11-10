import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PropTypes from 'prop-types';

export function FileUpload({ 
  label, 
  accept, 
  onChange, 
  className = '', 
  helperText,
  error 
}) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input
        type="file"
        accept={accept}
        onChange={onChange}
        className={`cursor-pointer ${className}`}
      />
      {helperText && (
        <p className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

FileUpload.propTypes = {
  label: PropTypes.string,
  accept: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.string
}; 