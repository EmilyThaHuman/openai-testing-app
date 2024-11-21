import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => null
});

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
}) {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem(storageKey);
    return storedTheme || defaultTheme;
  });

  // Memoize the theme value to prevent unnecessary re-renders
  const themeValue = useMemo(() => ({
    theme,
    setTheme: (newTheme) => {
      setTheme(newTheme);
      localStorage.setItem(storageKey, newTheme);
    }
  }), [theme, storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
