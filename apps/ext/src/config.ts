export const config = {
  API_URL: import.meta.env.VITE_API_URL,
  CRDBL_REGEX: /^crdbl:([0-9a-zA-Z-]{8,12})$/g,
  IPFS_URL: import.meta.env.VITE_IPFS_URL,
} as const;
