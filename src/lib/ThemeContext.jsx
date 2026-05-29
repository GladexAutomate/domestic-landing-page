import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ darkMode: true, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("gladex-theme");
    if (saved !== null) return saved === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });

  useEffect(() => {
    localStorage.setItem("gladex-theme", darkMode ? "dark" : "light");
    // Apply transition class to root for smooth global transitions
    document.documentElement.style.setProperty("--theme-transition", "all 0.4s ease");
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((d) => !d);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}