// src/components/VectorStoreList.js
import React from "react";
import { useStoreSelector } from '@/store/useStore';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Trash2 } from "lucide-react";

export const VectorStoreList = () => {
  const {
    vectorStores,
    loading,
    error,
    selectedVectorStore,
    deleteVectorStore,
    selectVectorStore
  } = useStoreSelector(state => ({
    vectorStores: state.vectorStores,
    loading: state.vectorStoreLoading,
    error: state.vectorStoreError,
    selectedVectorStore: state.selectedVectorStore,
    deleteVectorStore: state.deleteVectorStore,
    selectVectorStore: state.selectVectorStore
  }));

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive p-4">
        Error loading vector stores: {error}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2 p-2">
        {vectorStores.map((store) => (
          <Card
            key={store.id}
            className={`p-4 hover:bg-accent cursor-pointer ${
              selectedVectorStore?.id === store.id ? 'border-primary' : ''
            }`}
            onClick={() => selectVectorStore(store)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{store.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {store.id}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteVectorStore(store.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
