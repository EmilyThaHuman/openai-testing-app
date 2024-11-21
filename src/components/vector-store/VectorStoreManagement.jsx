import React, { useCallback } from 'react';
import { useStoreSelector } from '@/store/useStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Loader2 } from 'lucide-react';

export const VectorStoreManagement = () => {
  const {
    vectorStores,
    selectedStore,
    loading,
    error,
    createStore,
    selectStore,
    deleteStore
  } = useStoreSelector(state => ({
    vectorStores: state.vectorStores,
    selectedStore: state.selectedVectorStore,
    loading: state.loading,
    error: state.error,
    createStore: state.createVectorStore,
    selectStore: state.selectVectorStore,
    deleteStore: state.deleteVectorStore
  }));

  const { toast } = useToast();

  const handleCreateStore = useCallback(async (name) => {
    try {
      await createStore({ name });
      toast({
        title: 'Success',
        description: 'Vector store created successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [createStore, toast]);

  const handleStoreSelect = useCallback((store) => {
    selectStore(store);
  }, [selectStore]);

  const handleStoreDelete = useCallback(async (storeId) => {
    try {
      await deleteStore(storeId);
      toast({
        title: 'Success',
        description: 'Vector store deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [deleteStore, toast]);

  return (
    <div className="w-[440px] bg-zinc-900 rounded-lg p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">
          Vector Store Management
        </h2>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New store name..."
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateStore(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <Button
              onClick={() => handleCreateStore('New Store')}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-2">
            {vectorStores.map((store) => (
              <Card
                key={store.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedStore?.id === store.id ? 'bg-accent' : ''
                }`}
                onClick={() => handleStoreSelect(store)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{store.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {store.documentCount || 0} documents
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStoreDelete(store.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VectorStoreManagement);
