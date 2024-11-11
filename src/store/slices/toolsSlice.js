export const createToolsSlice = (set, get) => ({
  selectedTool: null,
  attachedTools: [],
  
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  
  attachTool: (tool) => 
    set((state) => ({
      attachedTools: [...state.attachedTools, tool]
    })),
    
  removeTool: (toolName) =>
    set((state) => ({
      attachedTools: state.attachedTools.filter(t => t.name !== toolName)
    })),
}); 