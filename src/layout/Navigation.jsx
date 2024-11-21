import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'
import { AppIcon } from '@/components/ui/AppIcon'
import { 
  FaGithub, 
  FaUserCircle, 
  FaCog, 
  FaSun, 
  FaMoon,
  FaExternalLinkAlt 
} from 'react-icons/fa'
import { DOCS_URL } from '@/lib/constants'

export function Navigation() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [searchValue, setSearchValue] = useState('')

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className={cn(
      "flex items-center justify-between p-4 border-b sticky top-0 backdrop-blur-sm z-50",
      "border-border bg-background/80"
    )}>
      <motion.a 
        href="/"
        className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
        whileHover={{ scale: 1.02 }}
      >
        <AppIcon size="sm" animate={false} />
        <div className="flex items-center">
          <span className="font-semibold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            ReedAI
          </span>
          <span className="text-foreground/80 font-medium ml-1">
            API
          </span>
        </div>
      </motion.a>

      <nav className="hidden md:flex items-center space-x-6">
        {/* Internal Links */}
        <NavLink internal href="/resources">Resources</NavLink>
        
        {/* External Links */}
        <ExternalLink href={DOCS_URL}>
          Documentation
          <FaExternalLinkAlt className="ml-2 h-3 w-3" />
        </ExternalLink>
        
        <ExternalLink href="https://docs.reed-ai.dev">
          API Reference
          <FaExternalLinkAlt className="ml-2 h-3 w-3" />
        </ExternalLink>
      </nav>

      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          className="hidden md:flex"
          onClick={() => window.open('https://github.com/EmilyThaHuman/openai-testing-app', '_blank')}
        >
          <FaGithub className="mr-2" />
          View on GitHub
        </Button>

        <Input
          className="w-[200px] focus:w-[300px] transition-all duration-300 hidden md:block"
          placeholder="Search API documentation..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/auth/login')}
        >
          <FaUserCircle className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
          className="hover:rotate-90 transition-transform duration-300"
        >
          <FaCog className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleThemeToggle}
          className="hover:rotate-90 transition-transform duration-300"
        >
          {theme === 'dark' ? (
            <FaMoon className="h-5 w-5" />
          ) : (
            <FaSun className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  )
}

// Internal NavLink component for router navigation
function NavLink({ internal = false, href, children }) {
  const navigate = useNavigate()
  
  const handleClick = (e) => {
    e.preventDefault()
    if (internal) {
      navigate(href)
    } else {
      window.open(href, '_blank', 'noopener,noreferrer')
    }
  }
  
  return (
    <motion.button
      onClick={handleClick}
      className="text-foreground/80 hover:text-primary relative"
      whileHover={{ y: -2 }}
    >
      <span className="flex items-center">{children}</span>
      <motion.div
        className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}

// External link component
function ExternalLink({ href, children }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground/80 hover:text-primary relative flex items-center"
      whileHover={{ y: -2 }}
    >
      <span className="flex items-center">{children}</span>
      <motion.div
        className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3 }}
      />
    </motion.a>
  )
}
