import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Settings } from '../settings';
import { config } from '../config';
import { settingsItem } from '../storage';

type Updater<K extends keyof Settings> = (v: Settings[K]) => void;
type UseSetting = <K extends keyof Settings>(k: K) => [Settings[K], Updater<K>];

const Ctx = createContext<{
  settings: Settings;
  set<K extends keyof Settings>(k: K, v: Settings[K]): void;
}>({
  settings: config.DEFAULT_SETTINGS,
  set: () => {
    throw new Error('SettingsProvider is missing');
  },
});

export const useSetting: UseSetting = (key) => {
  const { settings, set } = useContext(Ctx);
  return [settings[key], (v) => set(key, v)];
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(config.DEFAULT_SETTINGS);

  // load once + live-sync every entry-point
  useEffect(() => {
    settingsItem.getValue().then(setSettings);
    return settingsItem.watch(setSettings);
  }, []);

  // keep the <html data-theme=""> in sync when *theme* changes
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  // update a single field & persist
  function set<K extends keyof Settings>(key: K, val: Settings[K]) {
    const next = { ...settings, [key]: val };
    setSettings(next);
    settingsItem.setValue(next);
  }

  return <Ctx.Provider value={{ settings, set }}>{children}</Ctx.Provider>;
}
