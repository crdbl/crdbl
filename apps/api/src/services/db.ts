import { createClient } from 'redis';
import { REDIS_CACHE_TTL, REDIS_PASSWORD, REDIS_URL } from '../config.js';
import {
  CrdblCredential,
  CreateDidResponse,
  CredentialVerification,
} from '@crdbl/utils';

/*
 * These functions read/write to Redis.
 * Wrap in a try/catch block to handle errors.
 * null is returned if the key is not found.
 */

const redis = createClient({
  url: REDIS_URL,
  ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {}),
});

const health = async () => {
  try {
    if (!redis.isOpen) await redis.connect();
    await redis.ping();
  } catch (error) {
    throw new Error('redis connection failed');
  }
};

const getIssuer = async (): Promise<CreateDidResponse | null> => {
  if (!redis.isOpen) await redis.connect();

  const issuerRaw = await redis.get('issuer');
  if (!issuerRaw) return null;

  return JSON.parse(issuerRaw) as CreateDidResponse;
};

const setIssuer = async (issuer: CreateDidResponse) => {
  if (!redis.isOpen) await redis.connect();
  await redis.set('issuer', JSON.stringify(issuer));
};

const getCred = async (id: string): Promise<CrdblCredential | null> => {
  if (!redis.isOpen) await redis.connect();

  // Try to get by id first, then try to resolve alias
  let credentialRaw = await redis.get(`credential:${id}`);
  if (!credentialRaw) {
    const uuid = await redis.get(`alias:${id}`);
    if (uuid) credentialRaw = await redis.get(`credential:${uuid}`);
  }
  if (!credentialRaw) return null;

  return JSON.parse(credentialRaw) as CrdblCredential;
};

const setCred = async (
  id: string,
  credential: CrdblCredential,
  subjectDid: string // holder
) => {
  const { alias } = credential.credentialSubject;

  if (!redis.isOpen) await redis.connect();

  // Store credential (keyed by id)
  await redis.set(`credential:${id}`, JSON.stringify(credential));

  // Store alias, if there is one
  if (alias) await redis.set(`alias:${alias}`, id);

  // Store credential id in set for the holder
  await redis.sAdd(`holder:${subjectDid}`, id);
};

const getCredsByHolder = async (
  holderDid: string
): Promise<(CrdblCredential | null)[]> => {
  if (!redis.isOpen) await redis.connect();
  const ids = await redis.sMembers(`holder:${holderDid}`);
  const credentials = await Promise.all(
    ids.map(async (id) => {
      const c = await redis.get(`credential:${id}`);
      try {
        return c ? (JSON.parse(c) as CrdblCredential) : null;
      } catch {
        return null;
      }
    })
  );
  return credentials.filter(Boolean);
};

const setVerification = async (
  id: string,
  verification: CredentialVerification
) => {
  if (!redis.isOpen) await redis.connect();

  // cache the verification
  await redis.set(`verification:${id}`, JSON.stringify(verification), {
    expiration: { type: 'EX', value: REDIS_CACHE_TTL },
  });
};

const getVerification = async (
  id: string
): Promise<CredentialVerification | null> => {
  if (!redis.isOpen) await redis.connect();
  const v = await redis.get(`verification:${id}`);
  if (!v) return null;
  return JSON.parse(v) as CredentialVerification;
};

export default {
  redis,
  getCred,
  getCredsByHolder,
  getIssuer,
  getVerification,
  health,
  setCred,
  setIssuer,
  setVerification,
};
