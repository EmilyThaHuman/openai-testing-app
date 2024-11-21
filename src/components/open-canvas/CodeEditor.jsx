import React, { useState, useCallback, memo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  MoreVertical,
  Save,
  Settings2,
  Share2,
  Copy,
  Download,
  Trash2,
  Maximize2,
  Minimize2,
  Code,
  FileText,
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
}

const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

const menuItems = [
  {
    label: 'Save',
    icon: <Save className="w-4 h-4" />,
    action: 'save',
    shortcut: '⌘S',
  },
  {
    label: 'Copy',
    icon: <Copy className="w-4 h-4" />,
    action: 'copy',
    shortcut: '⌘C',
  },
  {
    label: 'Share',
    icon: <Share2 className="w-4 h-4" />,
    action: 'share',
  },
  {
    label: 'Download',
    icon: <Download className="w-4 h-4" />,
    action: 'download',
  },
  {
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    action: 'delete',
    variant: 'destructive',
  },
]

export function CodeEditor() {
  // State from store
  const currentFile = useStore(state => state.currentFile)
  const updateFile = useStore(state => state.updateFile)
  const deleteFile = useStore(state => state.deleteFile)
  const theme = useStore(state => state.theme)
  const files = useStore(state => state.files)
  const setCurrentFile = useStore(state => state.setCurrentFile)
  
  // Local state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSaved, setIsSaved] = useState(true)
  const [editorContent, setEditorContent] = useState('')

  // Update editor content when current file changes
  useEffect(() => {
    if (currentFile?.content !== undefined) {
      setEditorContent(currentFile.content)
      setIsSaved(true)
    }
  }, [currentFile?.id, currentFile?.content])

  // Handle content change with debounce
  const handleContentChange = useCallback((value) => {
    setEditorContent(value)
    setIsSaved(false)
  }, [])

  // Auto-save functionality
  useEffect(() => {
    if (!isSaved && currentFile) {
      const timeoutId = setTimeout(async () => {
        try {
          await updateFile(currentFile.id, { 
            content: editorContent,
            updatedAt: new Date().toISOString()
          })
          setIsSaved(true)
        } catch (error) {
          console.error('Failed to auto-save:', error)
        }
      }, 1000) // Auto-save after 1 second of no changes

      return () => clearTimeout(timeoutId)
    }
  }, [editorContent, currentFile, isSaved, updateFile])

  // Navigate between files
  const handleNavigate = useCallback((direction) => {
    if (!currentFile || !files.length) return

    const currentIndex = files.findIndex(f => f.id === currentFile.id)
    if (currentIndex === -1) return

    let newIndex
    if (direction === 'next') {
      newIndex = currentIndex === files.length - 1 ? 0 : currentIndex + 1
    } else {
      newIndex = currentIndex === 0 ? files.length - 1 : currentIndex - 1
    }

    setCurrentFile(files[newIndex])
  }, [currentFile, files, setCurrentFile])

  // Get file language for editor
  const getFileLanguage = useCallback((filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript'
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'css':
        return 'css'
      case 'json':
        return 'json'
      case 'md':
      case 'mdx':
        return 'markdown'
      default:
        return 'plaintext'
    }
  }, [])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!currentFile) return
    
    try {
      await updateFile(currentFile.id, { 
        content: editorContent,
        updatedAt: new Date().toISOString()
      })
      setIsSaved(true)
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }, [currentFile, editorContent, updateFile])

  // Handle menu actions
  const handleMenuAction = useCallback((action) => {
    switch (action) {
      case 'save':
        handleSave()
        break
      case 'delete':
        if (currentFile) {
          deleteFile(currentFile.id)
        }
        break
      // Add other actions...
    }
  }, [currentFile, handleSave, deleteFile])

  // Reset editor content when switching files
  useEffect(() => {
    if (currentFile) {
      setEditorContent(currentFile.content || '')
      setIsSaved(true)
    }
  }, [currentFile?.id])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col h-full",
        isFullscreen && "fixed inset-0 z-50 bg-background"
      )}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex justify-between items-center p-4 border-b"
      >
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous File</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium truncate max-w-[200px]">
              {currentFile?.name || 'Untitled'}
            </h2>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next File</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {!isSaved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-sm text-muted-foreground"
              >
                Unsaved changes
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </motion.div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {menuItems.map((item, index) => (
                <React.Fragment key={item.action}>
                  <DropdownMenuItem
                    onClick={() => handleMenuAction(item.action)}
                    className={cn(
                      "flex items-center justify-between",
                      item.variant === 'destructive' && "text-destructive"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </span>
                    {item.shortcut && (
                      <span className="text-xs text-muted-foreground">
                        {item.shortcut}
                      </span>
                    )}
                  </DropdownMenuItem>
                  {index < menuItems.length - 1 && <DropdownMenuSeparator />}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Editor */}
      <motion.div
        variants={itemVariants}
        className="flex-1 relative min-h-0"
      >
        <Editor
          height="100%"
          defaultLanguage={getFileLanguage(currentFile?.name)}
          value={editorContent}
          onChange={handleContentChange}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            smoothScrolling: true,
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            formatOnSave: true,
          }}
          onMount={(editor, monaco) => {
            editor.focus()
            // Add keyboard shortcuts
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
              handleSave
            )
          }}
        />
      </motion.div>
    </motion.div>
  )
}

export default memo(CodeEditor) 