import { CreateDidResponse } from '@crdbl/utils';
import { createClient } from 'redis';
import { createDid } from './services/cheqd-studio.js';
import { REDIS_URL } from './config.js';

const redis = createClient({ url: REDIS_URL });
await redis.connect();

console.log('Creating issuer DID...');
const issuer = await createDid();
await redis.set('issuer', JSON.stringify(issuer));

const v = await redis.get('issuer');
const issuer_: CreateDidResponse = JSON.parse(v ?? '{}');
console.log('issuer created', issuer_);

await redis.quit();
