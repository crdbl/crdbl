import { Settings } from './settings';

export const config = {
  API_URL: import.meta.env.VITE_API_URL,
  CRDBL_REGEX: /^crdbl:([0-9a-zA-Z-]{8,12})$/g,
  IPFS_URL: import.meta.env.VITE_IPFS_URL,

  DEFAULT_SETTINGS: {
    theme: 'dark',
  } satisfies Settings,
} as const;
