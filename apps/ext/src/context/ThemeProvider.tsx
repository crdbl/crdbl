import { createContext, useContext, useEffect, useState } from 'react';
import { config } from '../config';
import { settingsTheme, Theme } from '../storage';

const ThemeCtx = createContext<Theme>(config.DEFAULT_THEME);
export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(config.DEFAULT_THEME);

  // initial load + live sync across entry-points
  useEffect(() => {
    settingsTheme.getValue().then(setTheme); // first paint
    return settingsTheme.watch(setTheme); // cross-tab sync
  }, []);

  // write to <html data-theme="…">
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>;
}
