import { 
  FileCode, 
  FileJson, 
  FileText, 
  FileType, 
  Image,
  File
} from 'lucide-react'

export const FILE_TYPES = {
  javascript: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    icon: FileCode,
    language: 'javascript'
  },
  json: {
    extensions: ['.json'],
    icon: FileJson,
    language: 'json'
  },
  markdown: {
    extensions: ['.md', '.mdx'],
    icon: FileText,
    language: 'markdown'
  },
  image: {
    extensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
    icon: Image,
    language: 'image'
  }
}

export function getFileType(filename) {
  const extension = `.${filename.split('.').pop().toLowerCase()}`
  return Object.entries(FILE_TYPES).find(([_, type]) => 
    type.extensions.includes(extension)
  )?.[0] || 'text'
}

export function getFileIcon(filename) {
  const type = getFileType(filename)
  return FILE_TYPES[type]?.icon || File
}

export function getFileLanguage(filename) {
  const type = getFileType(filename)
  return FILE_TYPES[type]?.language || 'text'
}

// Auto-save debounce helper
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
} 