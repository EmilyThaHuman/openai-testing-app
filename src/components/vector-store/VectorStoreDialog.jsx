import React from "react";
import { useStoreSelector } from '@/store/useStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database } from "lucide-react";

export function VectorStoreDialog() {
  const {
    isOpen,
    storeId,
    setStoreId,
    handleClose,
    handleSelect
  } = useStoreSelector(state => ({
    isOpen: state.vectorStoreDialogOpen,
    storeId: state.vectorStoreId,
    setStoreId: state.setVectorStoreId,
    handleClose: state.closeVectorStoreDialog,
    handleSelect: state.selectVectorStore
  }));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Attach vector store</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          <Database className="h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium">Select existing vector store</h3>

          <div className="w-full">
            <Input
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              placeholder="Enter vector store id"
              className="w-full"
            />
          </div>

          <a href="#" className="text-primary text-sm hover:underline">
            Vector stores →
          </a>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="ghost" onClick={handleClose} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={() => handleSelect(storeId)}>Select</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
