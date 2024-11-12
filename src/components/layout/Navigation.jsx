import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

export function Navigation() {
  const { theme, toggleTheme } = useTheme();

  const dropdownItems = [
    { path: "/", label: "All APIs" },
    { path: "/assistants", label: "Assistants" },
    { path: "/images", label: "Images" },
    { path: "/audio", label: "Audio" },
  ];

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4 lg:space-x-6">
          <Link to="/">
            <h1 className="text-xl font-bold">OpenAI Test Site</h1>
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          {/* Main */}
          <Link to="/api">
            <Button variant="default">
              API Dashboard
            </Button>
          </Link>          
          <Link to="/chat">
            <Button variant="default">Chat</Button>
          </Link>
          <Link to="/">
            <Button variant="default">All Apis</Button>
          </Link>
          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {dropdownItems.map(({ path, label }) => (
                <DropdownMenuItem key={path} asChild>
                  <Link to={path} className="w-full">
                    {label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </Button>
        </nav>
      </div>
    </header>
  );
}
