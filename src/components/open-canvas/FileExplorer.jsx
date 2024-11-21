import React, { useEffect } from 'react';
import { useStoreSelector } from '@/store/useStore';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getDefaultFiles } from '@/lib/utils/defaultFiles';
import { 
  File, 
  Search, 
  Plus, 
  Grid, 
  List,
  Clock,
  SortAsc,
  SortDesc
} from 'lucide-react';

export function FileExplorer() {
  const {
    files,
    currentFile,
    searchQuery,
    fileViewMode,
    sortBy,
    sortDirection,
    setFiles,
    setCurrentFile,
    setSearchQuery,
    setFileViewMode,
    setSortBy,
    setSortDirection,
    createNewFile,
    deleteFile,
    initializeFiles
  } = useStoreSelector(state => ({
    files: state.files,
    currentFile: state.currentFile,
    searchQuery: state.searchQuery,
    fileViewMode: state.fileViewMode,
    sortBy: state.sortBy,
    sortDirection: state.sortDirection,
    setFiles: state.setFiles,
    setCurrentFile: state.setCurrentFile,
    setSearchQuery: state.setSearchQuery,
    setFileViewMode: state.setFileViewMode,
    setSortBy: state.setSortBy,
    setSortDirection: state.setSortDirection,
    createNewFile: state.createNewFile,
    deleteFile: state.deleteFile,
    initializeFiles: state.initializeFiles
  }));

  // Initialize with default files if no files exist
  useEffect(() => {
    if (!files || files.length === 0) {
      const defaultFiles = getDefaultFiles();
      setFiles(defaultFiles);
      setCurrentFile(defaultFiles[0]);
    }
  }, []);

  // Filter and sort files
  const filteredFiles = files
    .filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(b.updatedAt) - new Date(a.updatedAt);
          break;
        case 'size':
          comparison = (b.content?.length || 0) - (a.content?.length || 0);
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFileViewMode(fileViewMode === 'grid' ? 'list' : 'grid')}
          >
            {fileViewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={createNewFile}>
            <Plus className="h-4 w-4 mr-2" />
            New File
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortBy('name')}
            className={cn(sortBy === 'name' && 'bg-accent')}
          >
            Name
            {sortBy === 'name' && (
              sortDirection === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortBy('date')}
            className={cn(sortBy === 'date' && 'bg-accent')}
          >
            Date
            {sortBy === 'date' && (
              sortDirection === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="flex-1 p-4">
        <div className={cn(
          "grid gap-4",
          fileViewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'
        )}>
          {filteredFiles.map((file) => (
            <Button
              key={file.id}
              variant="ghost"
              className={cn(
                "w-full justify-between group hover:bg-accent",
                currentFile?.id === file.id && "bg-accent",
                fileViewMode === 'list' ? 'flex' : 'flex-col h-24'
              )}
              onClick={() => setCurrentFile(file)}
            >
              <div className={cn(
                "flex items-center gap-2",
                fileViewMode === 'grid' && "flex-col"
              )}>
                <File className="h-4 w-4 text-primary" />
                <span className="text-sm truncate">{file.name}</span>
              </div>
              
              <div className={cn(
                "flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity",
                fileViewMode === 'grid' && "flex-col"
              )}>
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {new Date(file.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 