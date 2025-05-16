import { createDid } from './services/cheqd-studio.js';
import db from './services/db.js';

console.log('Creating issuer DID...');
const issuer = await createDid();
await db.setIssuer(issuer);

const issuer_ = await db.getIssuer();
console.log('issuer created', issuer_);

await db.redis.quit();
