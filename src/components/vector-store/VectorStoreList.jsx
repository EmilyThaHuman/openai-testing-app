// src/components/VectorStoreList.js
import React, { useEffect, useState } from "react";
import {
  listVectorStores,
  deleteVectorStore,
} from "../services/vectorStoreService";

const VectorStoreList = ({ onSelect }) => {
  const [vectorStores, setVectorStores] = useState([]);

  useEffect(() => {
    const fetchVectorStores = async () => {
      try {
        const data = await listVectorStores();
        setVectorStores(data.data);
      } catch (error) {
        console.error("Error fetching vector stores:", error);
      }
    };
    fetchVectorStores();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteVectorStore(id);
      setVectorStores(vectorStores.filter((store) => store.id !== id));
    } catch (error) {
      console.error("Error deleting vector store:", error);
    }
  };

  return (
    <div>
      <h2>Vector Stores</h2>
      <ul>
        {vectorStores.map((store) => (
          <li key={store.id}>
            {store.name}
            <button onClick={() => onSelect(store.id)}>View</button>
            <button onClick={() => handleDelete(store.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VectorStoreList;
