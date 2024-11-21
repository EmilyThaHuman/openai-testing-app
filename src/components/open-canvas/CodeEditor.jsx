import { motion } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronLeft, ChevronRight, Check, MoreVertical, Save, Settings2, CheckCircle2, Maximize2, Minimize2 } from 'lucide-react'

const menuItems = [
  {
    label: 'Save',
    icon: <Save className="w-4 h-4 mr-2" />,
    action: () => {},
  },
  {
    label: 'Share',
    icon: <CheckCircle2 className="w-4 h-4 mr-2" />,
    action: () => {},
  },
  {
    label: 'Settings',
    icon: <Settings2 className="w-4 h-4 mr-2" />,
    action: () => {},
  },
]

export function CodeEditor({ 
  content, 
  onContentChange, 
  theme = 'light',
  isFullscreen,
  onToggleFullscreen,
  isSaved 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col p-4"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-bold">Code Editor</h2>
          <Button variant="ghost" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center text-muted-foreground"
            >
              <Check className="w-4 h-4 mr-1" />
              <span className="text-sm">Saved</span>
            </motion.div>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onToggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {menuItems.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={item.action}
                  className="flex items-center"
                >
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 h-[calc(100%-3rem)] relative">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={content}
          onChange={onContentChange}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          beforeMount={(monaco) => {
            monaco.editor.defineTheme('custom-light', {
              base: 'vs',
              inherit: true,
              rules: [],
              colors: {
                'editor.background': '#ffffff',
              }
            })
            monaco.editor.setTheme('custom-light')
          }}
        />
      </div>
    </motion.div>
  )
} 