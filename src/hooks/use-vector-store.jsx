import { useState, useCallback } from "react";
import { UnifiedOpenAIService } from "@/services/openai/unifiedOpenAIService";
import { useToast } from "@/components/ui/use-toast";

export function useVectorStore() {
  const [vectorStores, setVectorStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Fetch all vector stores
  const fetchVectorStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await UnifiedOpenAIService.vectorStores.list();
      setVectorStores(response.data);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error fetching vector stores",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create a new vector store
  const createVectorStore = useCallback(
    async (params) => {
      setLoading(true);
      setError(null);
      try {
        const response = await UnifiedOpenAIService.vectorStores.create(params);
        setVectorStores((prev) => [...prev, response]);
        toast({
          title: "Success",
          description: "Vector store created successfully",
        });
        return response;
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error creating vector store",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Get a specific vector store
  const getVectorStore = useCallback(
    async (vectorStoreId) => {
      setLoading(true);
      setError(null);
      try {
        const response =
          await UnifiedOpenAIService.vectorStores.get(vectorStoreId);
        return response;
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error fetching vector store",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Update a vector store
  const updateVectorStore = useCallback(
    async (vectorStoreId, params) => {
      setLoading(true);
      setError(null);
      try {
        const response = await UnifiedOpenAIService.vectorStores.update(
          vectorStoreId,
          params
        );
        setVectorStores((prev) =>
          prev.map((store) => (store.id === vectorStoreId ? response : store))
        );
        toast({
          title: "Success",
          description: "Vector store updated successfully",
        });
        return response;
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error updating vector store",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Delete a vector store
  const deleteVectorStore = useCallback(
    async (vectorStoreId) => {
      setLoading(true);
      setError(null);
      try {
        await UnifiedOpenAIService.vectorStores.delete(vectorStoreId);
        setVectorStores((prev) =>
          prev.filter((store) => store.id !== vectorStoreId)
        );
        toast({
          title: "Success",
          description: "Vector store deleted successfully",
        });
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error deleting vector store",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Vector store files operations
  const files = {
    // Upload file to vector store
    upload: async (vectorStoreId, params) => {
      setLoading(true);
      setError(null);
      try {
        const response = await UnifiedOpenAIService.vectorStoreFiles.create(
          vectorStoreId,
          params
        );
        toast({
          title: "Success",
          description: "File uploaded successfully",
        });
        return response;
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error uploading file",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // List files in vector store
    list: async (vectorStoreId) => {
      setLoading(true);
      setError(null);
      try {
        const response =
          await UnifiedOpenAIService.vectorStoreFiles.list(vectorStoreId);
        return response.data;
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error listing files",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Delete file from vector store
    delete: async (vectorStoreId, fileId) => {
      setLoading(true);
      setError(null);
      try {
        await UnifiedOpenAIService.vectorStoreFiles.delete(
          vectorStoreId,
          fileId
        );
        toast({
          title: "Success",
          description: "File deleted successfully",
        });
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error deleting file",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
  };

  return {
    vectorStores,
    loading,
    error,
    fetchVectorStores,
    createVectorStore,
    getVectorStore,
    updateVectorStore,
    deleteVectorStore,
    files,
  };
}
