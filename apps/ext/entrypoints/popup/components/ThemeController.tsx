import { IconMoon, IconSun } from '../../../src/components/icons';
import { useSetting } from '../../../src/context/SettingsProvider';

export function ThemeController() {
  const [theme, setTheme] = useSetting('theme'); // current value from context

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next); // updates storage → context sync
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm">Theme:</span>
      <label className="flex items-center cursor-pointer gap-2">
        <IconSun strokeWidth={2.0} />
        <input
          type="checkbox"
          className="toggle theme-controller"
          checked={theme === 'dark'}
          onChange={toggle}
        />
        <IconMoon strokeWidth={2.0} className="size-5" />
      </label>
    </div>
  );
}
