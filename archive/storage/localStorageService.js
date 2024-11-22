import React from "react";

let storageInstance = null;
let storagePrefix = "app_";

const checkInitialization = () => {
  if (!storageInstance) {
    throw new Error("Storage not initialized. Call initialize first.");
  }
  return storageInstance;
};

export const StorageService = {
  // Initialization
  initialize: (prefix = "app_") => {
    if (typeof window === "undefined") return;
    storagePrefix = prefix;
    storageInstance = window.localStorage;
  },

  setPrefix: (prefix) => {
    if (!prefix) return;
    storagePrefix = prefix;
  },

  // Items (General Storage Operations)
  items: {
    set: async (key, value) => {
      try {
        const storage = checkInitialization();
        const prefixedKey = `${storagePrefix}${key}`;
        const serializedValue = JSON.stringify({
          value,
          timestamp: new Date().toISOString(),
        });
        storage.setItem(prefixedKey, serializedValue);
        return { success: true, key: prefixedKey };
      } catch (error) {
        console.error("Storage Error:", error);
        throw error;
      }
    },

    get: async (key) => {
      try {
        const storage = checkInitialization();
        const prefixedKey = `${storagePrefix}${key}`;
        const item = storage.getItem(prefixedKey);
        if (!item) return null;
        return JSON.parse(item).value;
      } catch (error) {
        console.error("Storage Error:", error);
        throw error;
      }
    },

    delete: async (key) => {
      try {
        const storage = checkInitialization();
        const prefixedKey = `${storagePrefix}${key}`;
        storage.removeItem(prefixedKey);
        return { success: true };
      } catch (error) {
        console.error("Storage Error:", error);
        throw error;
      }
    },

    list: async () => {
      try {
        const storage = checkInitialization();
        const keys = Object.keys(storage).filter((key) =>
          key.startsWith(storagePrefix)
        );
        const items = keys.map((key) => ({
          key: key.replace(storagePrefix, ""),
          data: JSON.parse(storage.getItem(key)),
        }));
        return { data: items };
      } catch (error) {
        console.error("Storage Error:", error);
        throw error;
      }
    },

    clear: async () => {
      try {
        const storage = checkInitialization();
        const keys = Object.keys(storage).filter((key) =>
          key.startsWith(storagePrefix)
        );
        keys.forEach((key) => storage.removeItem(key));
        return { success: true };
      } catch (error) {
        console.error("Storage Error:", error);
        throw error;
      }
    },
  },

  // Collections (Managing Arrays of Items)
  collections: {
    create: async (collectionName, initialData = []) => {
      try {
        const storage = checkInitialization();
        const prefixedKey = `${storagePrefix}collection_${collectionName}`;
        const collection = {
          name: collectionName,
          items: initialData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        storage.setItem(prefixedKey, JSON.stringify(collection));
        return collection;
      } catch (error) {
        console.error("Storage Error:", error);
        throw error;
      }
    },

    get: async (collectionName) => {
      try {
        const storage = checkInitialization();
        const prefixedKey = `${storagePrefix}collection_${collectionName}`;
        const collection = storage.getItem(prefixedKey);
        return collection ? JSON.parse(collection) : null;
      } catch (error) {
        console.error("Storage Error:", error);
        throw error;
      }
    },

    list: async () => {
      try {
        const storage = checkInitialization();
        const collectionPrefix = `${storagePrefix}collection_`;
        const collections = Object.keys(storage)
          .filter((key) => key.startsWith(collectionPrefix))
          .map((key) => JSON.parse(storage.getItem(key)));
        return { data: collections };
      } catch (error) {
        console.error("Storage Error:", error);
        throw error;
      }
    },

    update: async (collectionName, updateFn) => {
      try {
        const storage = checkInitialization();
        const prefixedKey = `${storagePrefix}collection_${collectionName}`;
        const collection = JSON.parse(
          storage.getItem(prefixedKey) || '{"items": []}'
        );
        const updatedCollection = {
          ...collection,
          items: updateFn(collection.items),
          updated_at: new Date().toISOString(),
        };
        storage.setItem(prefixedKey, JSON.stringify(updatedCollection));
        return updatedCollection;
      } catch (error) {
        console.error("Storage Error:", error);
        throw error;
      }
    },

    delete: async (collectionName) => {
      try {
        const storage = checkInitialization();
        const prefixedKey = `${storagePrefix}collection_${collectionName}`;
        storage.removeItem(prefixedKey);
        return { success: true };
      } catch (error) {
        console.error("Storage Error:", error);
        throw error;
      }
    },

    // Collection Items Operations
    items: {
      add: async (collectionName, item) => {
        return await StorageService.collections.update(
          collectionName,
          (items) => [...items, { ...item, id: crypto.randomUUID() }]
        );
      },

      remove: async (collectionName, itemId) => {
        return await StorageService.collections.update(
          collectionName,
          (items) => items.filter((item) => item.id !== itemId)
        );
      },

      update: async (collectionName, itemId, updateData) => {
        return await StorageService.collections.update(
          collectionName,
          (items) =>
            items.map((item) =>
              item.id === itemId ? { ...item, ...updateData } : item
            )
        );
      },

      get: async (collectionName, itemId) => {
        const collection =
          await StorageService.collections.get(collectionName);
        return collection?.items.find((item) => item.id === itemId) || null;
      },
    },
  },

  // React Hooks
  useStorage: (key, initialValue = null) => {
    const [value, setValue] = React.useState(initialValue);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      const loadValue = async () => {
        try {
          const storedValue = await StorageService.items.get(key);
          setValue(storedValue !== null ? storedValue : initialValue);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };
      loadValue();
    }, [key, initialValue]);

    const updateValue = async (newValue) => {
      try {
        setLoading(true);
        await StorageService.items.set(key, newValue);
        setValue(newValue);
        return true;
      } catch (err) {
        setError(err);
        return false;
      } finally {
        setLoading(false);
      }
    };

    return { value, setValue: updateValue, loading, error };
  },

  useCollection: (collectionName, initialData = []) => {
    const [collection, setCollection] = React.useState({ items: initialData });
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      const loadCollection = async () => {
        try {
          let storedCollection =
            await StorageService.collections.get(collectionName);
          if (!storedCollection) {
            storedCollection = await StorageService.collections.create(
              collectionName,
              initialData
            );
          }
          setCollection(storedCollection);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };
      loadCollection();
    }, [collectionName]);

    const addItem = async (item) => {
      try {
        setLoading(true);
        const updated = await StorageService.collections.items.add(
          collectionName,
          item
        );
        setCollection(updated);
        return true;
      } catch (err) {
        setError(err);
        return false;
      } finally {
        setLoading(false);
      }
    };

    const removeItem = async (itemId) => {
      try {
        setLoading(true);
        const updated = await StorageService.collections.items.remove(
          collectionName,
          itemId
        );
        setCollection(updated);
        return true;
      } catch (err) {
        setError(err);
        return false;
      } finally {
        setLoading(false);
      }
    };

    const updateItem = async (itemId, updateData) => {
      try {
        setLoading(true);
        const updated = await StorageService.collections.items.update(
          collectionName,
          itemId,
          updateData
        );
        setCollection(updated);
        return true;
      } catch (err) {
        setError(err);
        return false;
      } finally {
        setLoading(false);
      }
    };

    return {
      collection,
      loading,
      error,
      addItem,
      removeItem,
      updateItem,
      items: collection.items,
    };
  },
};

/* Usage Examples:

// Initialize the service
StorageService.initialize('myapp_');

// Basic storage operations
await StorageService.items.set('user_settings', { theme: 'dark' });
const settings = await StorageService.items.get('user_settings');

// Collections
await StorageService.collections.create('todos');
await StorageService.collections.items.add('todos', { 
  title: 'Buy groceries',
  completed: false
});

// React Hooks Usage
function SettingsComponent() {
  const { value, setValue, loading, error } = StorageService.useStorage(
    'user_settings',
    { theme: 'light' }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Current Theme: {value.theme}</h2>
      <button onClick={() => setValue({ theme: 'dark' })}>
        Switch to Dark
      </button>
    </div>
  );
}

function TodoListComponent() {
  const {
    items,
    loading,
    error,
    addItem,
    removeItem,
    updateItem
  } = StorageService.useCollection('todos', []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => addItem({ title: 'New Todo', completed: false })}>
        Add Todo
      </button>
      {items.map(todo => (
        <div key={todo.id}>
          {todo.title}
          <button onClick={() => removeItem(todo.id)}>Delete</button>
          <button onClick={() => updateItem(todo.id, { completed: !todo.completed })}>
            Toggle
          </button>
        </div>
      ))}
    </div>
  );
}
*/

export default StorageService;
