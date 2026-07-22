import { createContext, useContext } from "react";

const ThemeContext = createContext({ darkMode: false, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={{ darkMode: false, toggleTheme: () => {}, setDarkMode: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
