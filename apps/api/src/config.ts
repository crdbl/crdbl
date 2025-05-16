const config = {
  CHEQD_HEADERS: {},
  CHEQD_NETWORK: process.env.CHEQD_NETWORK ?? 'testnet',
  CHEQD_STUDIO_URL:
    process.env.CHEQD_STUDIO_URL ?? 'https://studio-api.cheqd.net',
  REDIS_CACHE_TTL: 60 * 10, // cache some query results
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',

  // secrets
  CHEQD_API_KEY: process.env.CHEQD_API_KEY,
};

config.CHEQD_HEADERS = {
  'x-api-key': config.CHEQD_API_KEY,
  'content-type': 'application/json',
};

const required = ['CHEQD_API_KEY'] as const;
const missing = required.filter((key) => config[key] === undefined);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}`
  );
}

export default config;

export const {
  CHEQD_HEADERS,
  CHEQD_NETWORK,
  CHEQD_STUDIO_URL,
  REDIS_CACHE_TTL,
  REDIS_URL,
} = config;
