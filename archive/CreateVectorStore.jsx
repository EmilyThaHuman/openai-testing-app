// src/components/CreateVectorStore.js
import React, { useState } from "react";
import { createVectorStore } from "../services/vectorStoreService";

const CreateVectorStore = ({ onCreate }) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newStore = await createVectorStore(name);
      onCreate(newStore);
      setName("");
    } catch (error) {
      console.error("Error creating vector store:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <button type="submit">Create Vector Store</button>
    </form>
  );
};

export default CreateVectorStore;
