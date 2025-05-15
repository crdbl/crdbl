import { FastifyPluginAsync } from 'fastify';
import { createClient } from 'redis';
import { customAlphabet } from 'nanoid';
import { nolookalikesSafe } from 'nanoid-dictionary';
import { REDIS_URL } from '../config.js';
import { issueCredential } from '../services/cheqd-studio.js';
import { CrdblCredentialAttributes, verifyHolderDid } from '@crdbl/utils';

const redis = createClient({ url: REDIS_URL });

const nanoid = (length = 10): string =>
  customAlphabet(nolookalikesSafe, length)();

const credential: FastifyPluginAsync = async (
  fastify,
  _opts
): Promise<void> => {
  fastify.post('/credential/issue', async function (request, reply) {
    const { subjectDid, attributes, signature, opts } = request.body as {
      subjectDid?: string;
      attributes?: CrdblCredentialAttributes;
      signature?: string;
      // crdbl-specific options
      opts?: {
        // default: false; iff true, generate short unique identifier
        generateAlias?: boolean;
      };
    };
    if (
      !subjectDid ||
      !attributes ||
      !signature ||
      typeof attributes.content !== 'string'
    ) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }
    try {
      if (!redis.isOpen) await redis.connect();
      const issuerRaw = await redis.get('issuer');
      if (!issuerRaw) {
        return reply
          .status(500)
          .send({ error: 'Issuer DID not found in Redis' });
      }
      const issuer = JSON.parse(issuerRaw);

      const valid = await verifyHolderDid(
        subjectDid,
        attributes.content,
        signature
      );
      if (!valid) return reply.status(401).send({ error: 'Invalid signature' });

      const alias = opts?.generateAlias ? nanoid() : undefined;
      const id = `urn:uuid:${crypto.randomUUID()}`;

      const credential = await issueCredential({
        id,
        issuerDid: issuer.did,
        subjectDid,
        attributes: {
          ...attributes,
          alias,
        },
      });

      // Store credential (keyed by id)
      await redis.set(`credential:${id}`, JSON.stringify(credential));

      // Store alias, if there is one
      if (alias) await redis.set(`alias:${alias}`, id);

      // Store credential id in set for the holder
      await redis.sAdd(`holder:${subjectDid}`, id);

      return credential;
    } catch (error: any) {
      fastify.log.error(error);
      return reply
        .status(500)
        .send({ error: error.message || 'Internal server error' });
    }
  });

  // List all credentials for a given holder DID
  fastify.get('/credential/list/:did', async function (request, reply) {
    const { did } = request.params as { did: string };
    if (!did) return reply.status(400).send({ error: 'Missing DID' });
    try {
      if (!redis.isOpen) await redis.connect();
      const ids = await redis.sMembers(`holder:${did}`);
      const credentials = await Promise.all(
        ids.map(async (id) => {
          const c = await redis.get(`credential:${id}`);
          try {
            return c ? JSON.parse(c) : null;
          } catch {
            return null;
          }
        })
      );
      const parsed = credentials.filter(Boolean);
      return parsed;
    } catch (error: any) {
      fastify.log.error(error);
      return reply
        .status(500)
        .send({ error: error.message || 'Internal server error' });
    }
  });
};

export default credential;
