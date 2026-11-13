import { createContext, useContext, useState, useEffect } from "react";
const ThemeContext = createContext({
  theme: "dark", toggle: () => {
  }
});
function ThemeProvider({ children }) {
  const [hasExplicitPref, setHasExplicitPref] = useState(() => {
    try {
      const stored = localStorage.getItem("sanskritlab-theme");
      return stored === "light" || stored === "dark";
    } catch {
      return false;
    }
  });
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem("sanskritlab-theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch {
      // Storage access blocked or unavailable
    }
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    return "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    if (hasExplicitPref) {
      try {
        localStorage.setItem("sanskritlab-theme", theme);
      } catch (e) {
        console.warn("Could not persist theme to localStorage:", e);
      }
    }
  }, [theme, hasExplicitPref]);

  // Listen for OS system theme changes if user hasn't explicitly set preference
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia || hasExplicitPref) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (e) => {
      setThemeState(e.matches ? "light" : "dark");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [hasExplicitPref]);

  const setTheme = (next) => {
    setHasExplicitPref(true);
    setThemeState(next);
  };
  const toggle = () => {
    setHasExplicitPref(true);
    setThemeState((t) => (t === "dark" ? "light" : "dark"));
  };
  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
function useTheme() {
  return useContext(ThemeContext);
}
export {
  ThemeProvider,
  useTheme
};
