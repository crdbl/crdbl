const config = {
  AI_ENDPOINT:
    process.env.AI_ENDPOINT ?? 'https://api.openai.com/v1/chat/completions',
  AI_MODEL: process.env.AI_MODEL ?? 'gpt-4o-mini',
  AI_TEMPERATURE: process.env.AI_TEMPERATURE ?? 0,
  CHEQD_HEADERS: {},
  CHEQD_NETWORK: process.env.CHEQD_NETWORK ?? 'testnet',
  CHEQD_STUDIO_URL:
    process.env.CHEQD_STUDIO_URL ?? 'https://studio-api.cheqd.net',
  IPFS_URL: process.env.IPFS_URL ?? 'http://localhost:5001',
  REDIS_CACHE_TTL: 60 * 10, // cache some query results
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',

  // secrets
  CHEQD_API_KEY: process.env.CHEQD_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PINATA_JWT: process.env.PINATA_JWT, // Pinata NOTE: "PAID_FEATURE_ONLY": "You must be on a paid plan to pin by CID"
};

config.CHEQD_HEADERS = {
  'x-api-key': config.CHEQD_API_KEY,
  'content-type': 'application/json',
};

const required = ['CHEQD_API_KEY', 'IPFS_URL', 'OPENAI_API_KEY'] as const;
const missing = required.filter((key) => config[key] === undefined);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}`
  );
}

export default config;

export const {
  AI_ENDPOINT,
  AI_MODEL,
  AI_TEMPERATURE,
  CHEQD_HEADERS,
  CHEQD_NETWORK,
  CHEQD_STUDIO_URL,
  IPFS_URL,
  OPENAI_API_KEY,
  PINATA_JWT,
  REDIS_CACHE_TTL,
  REDIS_PASSWORD,
  REDIS_URL,
} = config;
