import React from "react";
import { useStoreSelector } from '@/store/useStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, ArrowLeft, Search } from "lucide-react";

export const VectorStoreManagement = () => {
  const {
    vectorStoreId,
    newStoreName,
    loading,
    error,
    isCreateDialogOpen,
    setVectorStoreId,
    setNewStoreName,
    setIsCreateDialogOpen,
    createVectorStore,
    selectVectorStore,
    handleBack,
    handleCancel
  } = useStoreSelector(state => ({
    vectorStoreId: state.vectorStoreId,
    newStoreName: state.newStoreName,
    loading: state.vectorStoreLoading,
    error: state.vectorStoreError,
    isCreateDialogOpen: state.isCreateDialogOpen,
    setVectorStoreId: state.setVectorStoreId,
    setNewStoreName: state.setNewStoreName,
    setIsCreateDialogOpen: state.setIsCreateDialogOpen,
    createVectorStore: state.createVectorStore,
    selectVectorStore: state.selectVectorStore,
    handleBack: state.handleVectorStoreBack,
    handleCancel: state.handleVectorStoreCancel
  }));

  const handleCreateStore = async () => {
    if (!newStoreName.trim()) return;
    await createVectorStore(newStoreName);
  };

  return (
    <div className="w-[440px] bg-zinc-900 rounded-lg p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">
          Attach vector store
        </h2>

        <div className="space-y-4">
          <div className="flex justify-center">
            <Database className="h-12 w-12 text-zinc-400" />
          </div>

          <h3 className="text-center text-white text-lg">
            Select existing vector store
          </h3>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Enter vector store id"
              value={vectorStoreId}
              onChange={(e) => setVectorStoreId(e.target.value)}
              className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <button
            onClick={() => window.open("/vector-stores", "_blank")}
            className="w-full text-center text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Vector stores ↗
          </button>

          {error && (
            <Alert
              variant="destructive"
              className="bg-red-900/50 border-red-900"
            >
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              Create new vector store
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 text-white">
            <DialogHeader>
              <DialogTitle>Create New Vector Store</DialogTitle>
            </DialogHeader>
            <Input
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              placeholder="Vector Store Name"
              className="my-4 bg-zinc-800 border-zinc-700"
            />
            <DialogFooter>
              <Button
                onClick={handleCreateStore}
                disabled={loading || !newStoreName.trim()}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex justify-between pt-4 border-t border-zinc-800">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="space-x-2">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectVectorStore(vectorStoreId)}
              disabled={!vectorStoreId.trim()}
              className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            >
              Select
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default { VectorStoreManagement };
