import React, { useCallback, memo, useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getDefaultFiles } from '@/lib/utils/files'
import {
  File,
  Search,
  Plus,
  Grid,
  List,
  Clock,
  SortAsc,
  SortDesc,
  Folder,
  MoreVertical,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  }
}

export function FileExplorer() {
  const { toast } = useToast()
  
  // Use individual selectors for better performance
  const {
    files,
    currentFile,
    searchQuery,
    fileViewMode,
    sortBy,
    sortDirection,
    loading,
    setFiles,
    setSearchQuery,
    setFileViewMode,
    setSortBy,
    setSortDirection,
    setCurrentFile,
    addFile,
    deleteFile,
    updateFile
  } = useStore(state => ({
    files: state.files || [],
    currentFile: state.currentFile,
    searchQuery: state.searchQuery || '',
    fileViewMode: state.fileViewMode || 'list',
    sortBy: state.sortBy || 'name',
    sortDirection: state.sortDirection || 'asc',
    loading: state.loading,
    setFiles: state.setFiles,
    setSearchQuery: state.setSearchQuery,
    setFileViewMode: state.setFileViewMode,
    setSortBy: state.setSortBy,
    setSortDirection: state.setSortDirection,
    setCurrentFile: state.setCurrentFile,
    addFile: state.addFile,
    deleteFile: state.deleteFile,
    updateFile: state.updateFile
  }))

  const [isRenaming, setIsRenaming] = useState(false)
  const [fileToRename, setFileToRename] = useState(null)
  const [newFileName, setNewFileName] = useState('')

  // Load default files on mount
  useEffect(() => {
    const loadDefaultFiles = async () => {
      if (files.length === 0) {
        try {
          const defaultFiles = await getDefaultFiles()
          setFiles(defaultFiles)
          // Set first file as current if none selected
          if (!currentFile && defaultFiles.length > 0) {
            setCurrentFile(defaultFiles[0])
          }
        } catch (error) {
          console.error('Failed to load default files:', error)
        }
      }
    }

    loadDefaultFiles()
  }, [files.length, currentFile, setFiles, setCurrentFile])

  // Memoized handlers
  const handleSearchChange = useCallback((e) => {
    setSearchQuery?.(e.target.value)
  }, [setSearchQuery])

  const handleViewModeToggle = useCallback(() => {
    setFileViewMode?.(fileViewMode === 'grid' ? 'list' : 'grid')
  }, [fileViewMode, setFileViewMode])

  const handleSortChange = useCallback((newSortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection?.(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy?.(newSortBy)
      setSortDirection?.('asc')
    }
  }, [sortBy, sortDirection, setSortBy, setSortDirection])

  const handleFileSelect = useCallback((file) => {
    if (file.id !== currentFile?.id) {
      setCurrentFile(file)
    }
  }, [currentFile, setCurrentFile])

  // Add new file handler with proper extension detection
  const handleCreateNewFile = useCallback(async () => {
    try {
      const newFile = {
        name: 'New File.js',
        content: '// Write your code here\n',
        language: 'javascript',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      const createdFile = await addFile(newFile)
      if (createdFile) {
        toast({
          title: 'Success',
          description: 'New file created successfully'
        })
      }
    } catch (error) {
      console.error('Failed to create file:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create new file',
        variant: 'destructive'
      })
    }
  }, [addFile, toast])

  // Add delete file handler with confirmation
  const handleDeleteFile = useCallback(async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      await deleteFile(fileId)
      if (currentFile?.id === fileId) {
        setCurrentFile(files[0] || null)
      }
    }
  }, [deleteFile, currentFile, files, setCurrentFile])

  // Add rename handler
  const handleRenameFile = useCallback((fileId) => {
    const file = files.find(f => f.id === fileId)
    if (file) {
      setFileToRename(file)
      setNewFileName(file.name)
      setIsRenaming(true)
    }
  }, [files])

  // Add rename submit handler
  const handleRenameSubmit = useCallback(async () => {
    if (!fileToRename || !newFileName.trim()) return

    try {
      await updateFile(fileToRename.id, {
        ...fileToRename,
        name: newFileName,
        updatedAt: new Date().toISOString()
      })
      setIsRenaming(false)
      setFileToRename(null)
      setNewFileName('')
    } catch (error) {
      console.error('Failed to rename file:', error)
    }
  }, [fileToRename, newFileName, updateFile])

  // Filter and sort files
  const filteredFiles = files
    .filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = new Date(b.updatedAt) - new Date(a.updatedAt)
          break
        case 'size':
          comparison = (b.content?.length || 0) - (a.content?.length || 0)
          break
        default:
          comparison = 0
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleViewModeToggle}
              className="hidden sm:flex"
            >
              {fileViewMode === 'grid' ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid className="h-4 w-4" />
              )}
            </Button>
            <Button 
              onClick={handleCreateNewFile}
              className="whitespace-nowrap gap-2"
            >
              <Plus className="h-4 w-4" />
              New File
            </Button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSortChange('name')}
              className={cn(
                "whitespace-nowrap",
                sortBy === 'name' && 'bg-accent'
              )}
            >
              Name
              {sortBy === 'name' && (
                sortDirection === 'asc' ? (
                  <SortAsc className="h-4 w-4 ml-1" />
                ) : (
                  <SortDesc className="h-4 w-4 ml-1" />
                )
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSortChange('date')}
              className={cn(
                "whitespace-nowrap",
                sortBy === 'date' && 'bg-accent'
              )}
            >
              Date
              {sortBy === 'date' && (
                sortDirection === 'asc' ? (
                  <SortAsc className="h-4 w-4 ml-1" />
                ) : (
                  <SortDesc className="h-4 w-4 ml-1" />
                )
              )}
            </Button>
          </div>
        </div>

        {/* File List */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              'p-4 grid gap-2',
              fileViewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            )}
          >
            <AnimatePresence mode="wait">
              {filteredFiles.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full text-center py-8 text-muted-foreground"
                >
                  {searchQuery ? 'No files match your search' : 'No files yet'}
                </motion.div>
              ) : (
                filteredFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    variants={itemVariants}
                    layout
                    className={cn(
                      'group p-3 rounded-lg border hover:bg-accent/50 transition-colors',
                      'cursor-pointer relative',
                      currentFile?.id === file.id && 'bg-accent'
                    )}
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="flex items-center gap-2">
                      <FileIcon file={file} />
                      <span className="flex-1 truncate text-sm">{file.name}</span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation() // Prevent file selection
                                handleRenameFile(file.id)
                              }}
                            >
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation() // Prevent file selection
                                handleDeleteFile(file.id)
                              }}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {fileViewMode === 'grid' && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Last modified: {new Date(file.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </ScrollArea>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter new file name"
              className="w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleRenameSubmit()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRenaming(false)
                setFileToRename(null)
                setNewFileName('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// File icon component based on file type
const FileIcon = memo(function FileIcon({ file }) {
  const getIconByExtension = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js':
      case 'jsx':
        return <File className="h-4 w-4 text-yellow-500" />
      case 'ts':
      case 'tsx':
        return <File className="h-4 w-4 text-blue-500" />
      case 'css':
      case 'scss':
        return <File className="h-4 w-4 text-pink-500" />
      case 'json':
        return <File className="h-4 w-4 text-green-500" />
      case 'md':
      case 'mdx':
        return <File className="h-4 w-4 text-purple-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  return getIconByExtension(file.name)
})

export default memo(FileExplorer)
