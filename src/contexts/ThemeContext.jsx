import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check local storage or default to dark
    const savedTheme = localStorage.getItem('policyai_theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    // Apply the theme to the <html> tag
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('policyai_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const setLightMode = () => setTheme('light');
  const setDarkMode = () => setTheme('dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setLightMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
