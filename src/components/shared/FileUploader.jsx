import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';

export const FileUploader = ({
  open,
  onClose,
  onUpload,
  accept,
  multiple = false
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple,
    onDrop: onUpload
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-lg p-8 text-center"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag & drop files here, or click to select files</p>
        )}
      </div>
    </Dialog>
  );
}; 

FileUploader.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  accept: PropTypes.object,
  multiple: PropTypes.bool
};