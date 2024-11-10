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

// Props validation with PropTypes could be added if desired
export function VectorStoreDialog({ open, onClose, onSelect }) {
  const handleSelect = () => {
    // For now, just pass the input value
    const storeId = document.getElementById("vector-store-id")?.value;
    if (storeId) {
      onSelect(storeId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Attach vector store</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          <Database className="h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium">Select existing vector store</h3>

          <div className="w-full">
            <Input
              id="vector-store-id"
              placeholder="Enter vector store id"
              className="w-full"
            />
          </div>

          <a href="#" className="text-primary text-sm hover:underline">
            Vector stores →
          </a>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSelect}>Select</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// If you want to add prop validation, you can use PropTypes:
/*
import PropTypes from 'prop-types';

VectorStoreDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired
};
*/
