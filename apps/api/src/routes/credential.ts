import { FastifyPluginAsync } from 'fastify';
import { createClient } from 'redis';
import { REDIS_URL } from '../config.js';
import { issueCredential } from '../services/cheqd-studio.js';
import { verifyHolderDid } from '@crdbl/utils';

const redis = createClient({ url: REDIS_URL });

const credential: FastifyPluginAsync = async (
  fastify,
  _opts
): Promise<void> => {
  fastify.post('/credential/issue', async function (request, reply) {
    const { subjectDid, attributes, signature } = request.body as {
      subjectDid?: string;
      attributes?: { content: string };
      signature?: string;
    };
    if (
      !subjectDid ||
      !attributes ||
      typeof attributes.content !== 'string' ||
      !signature
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

      const credential = await issueCredential({
        issuerDid: issuer.did,
        subjectDid,
        attributes,
      });

      // Store credential in Redis (append to list)
      const key = `credential:${subjectDid}`;
      await redis.rPush(key, JSON.stringify(credential));
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
      const key = `credential:${did}`;
      const credentials = await redis.lRange(key, 0, -1);
      const parsed = credentials
        .map((c) => {
          try {
            return JSON.parse(c);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
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
