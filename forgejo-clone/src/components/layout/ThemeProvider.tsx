"use client";

import * as React from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({ theme: "dark", setTheme: () => {} });

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  attribute = "class",
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);

  React.useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) setThemeState(saved);
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    if (disableTransitionOnChange) {
      root.style.setProperty("transition", "none");
      setTimeout(() => root.style.removeProperty("transition"), 0);
    }
    if (attribute === "class") {
      root.classList.remove("light", "dark");
      const resolved = theme === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : theme;
      root.classList.add(resolved);
    }
    localStorage.setItem("theme", theme);
  }, [theme, attribute, disableTransitionOnChange]);

  const setTheme = React.useCallback((t: Theme) => setThemeState(t), []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
