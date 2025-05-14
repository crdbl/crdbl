import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],

  manifest: {
    permissions: ['storage', 'sidepanel', 'sidebar_action', 'contextMenus'],
  },

  vite: () => ({
    plugins: [tailwindcss(), tsconfigPaths()],
  }),
});
