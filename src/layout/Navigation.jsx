import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Logo } from './Logo'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'
import { 
  FaGithub, 
  FaUserCircle, 
  FaCog, 
  FaSun, 
  FaMoon,
  FaExternalLinkAlt 
} from 'react-icons/fa'

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
      <Logo />

      <nav className="hidden md:flex items-center space-x-6">
        <NavLink href="/resources">Resources</NavLink>
        <NavLink href="https://docs.reed-ai.dev" target="_blank">
          <FaExternalLinkAlt className="h-4 w-4" />
        </NavLink>
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

function NavLink({ href, children }) {
  const navigate = useNavigate()
  
  return (
    <motion.button
      onClick={() => navigate(href)}
      className="text-foreground/80 hover:text-primary relative"
      whileHover={{ y: -2 }}
    >
      <span>{children}</span>
      <motion.div
        className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}
