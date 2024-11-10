import PropTypes from 'prop-types';

export function FileUploadDialog({
  open,
  onClose,
  onUpload,
  purpose = "assistants",
}) {
  const handleUpload = async () => {
    try {
      setUploading(true);
      
      // Upload to Supabase first
      const uploadPromises = files.map(async (file) => {
        const supabaseFile = await uploadToSupabase(file, user.id);
        
        // Create a new File object with the public URL
        const fileWithMetadata = new File(
          [file],
          file.name,
          {
            type: file.type,
          }
        );
        // You might want to store the Supabase path/url in your database
        return fileWithMetadata;
      });

      const processedFiles = await Promise.all(uploadPromises);
      
      // Then proceed with OpenAI upload
      await onUpload(processedFiles);
      
      setFiles([]);
      onClose();
      toast({
        title: "Files uploaded",
        description: "Your files have been uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
}

FileUploadDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  purpose: PropTypes.string
};
