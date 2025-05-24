import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { config } from './src/config';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],

  manifest: {
    host_permissions: [`${config.API_URL}/*`, `${config.IPFS_URL}/*`],

    permissions: ['storage', 'sidepanel', 'sidebar_action', 'contextMenus'],
  },

  vite: () => ({
    plugins: [tailwindcss(), tsconfigPaths()],
  }),
});
