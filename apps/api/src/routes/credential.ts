import { FastifyPluginAsync } from 'fastify';
import { customAlphabet } from 'nanoid';
import { nolookalikesSafe } from 'nanoid-dictionary';
import { CrdblCredentialIssueRequest, verifyHolderDid } from '@crdbl/utils';
import { issueCredential, verifyCredential } from '../services/cheqd-studio.js';
import ai from '../services/ai.js';
import db from '../services/db.js';
import ipfs from '../services/ipfs.js';

const nanoid = (length = 10): string =>
  customAlphabet(nolookalikesSafe, length)();

// Helper to get or verify a credential and cache the result
async function getOrVerifyCredential(id: string) {
  const cred = await db.getCred(id);
  if (!cred) return { cred: null, verif: null };
  let verif = await db.getVerification(id);
  if (!verif) {
    verif = await verifyCredential(cred.proof.jwt);
    await db.setVerification(id, verif);
  }
  return { cred, verif };
}

const credential: FastifyPluginAsync = async (
  fastify,
  _opts
): Promise<void> => {
  fastify.post('/credential/issue', async function (request, reply) {
    const { subjectDid, attributes, signature, opts } =
      request.body as CrdblCredentialIssueRequest;
    if (
      !subjectDid ||
      !attributes ||
      !signature ||
      typeof attributes.content !== 'string' ||
      !Array.isArray(attributes.context)
    ) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }
    try {
      const issuer = await db.getIssuer();
      if (!issuer)
        return reply.status(500).send({ error: 'Issuer DID not found' });

      // ensure authentication of the subject DID
      const valid = await verifyHolderDid(
        subjectDid,
        attributes.content,
        attributes.context,
        signature
      );
      if (!valid) return reply.status(401).send({ error: 'Invalid signature' });

      console.log('attributes', attributes);

      // Check all context crdbls exist and are verified with data in IPFS
      const context = []; // all referenced context
      for (const ctxId of attributes.context) {
        const { cred: ctxCred, verif: ctxVerif } =
          await getOrVerifyCredential(ctxId);
        if (!ctxCred) {
          return reply
            .status(400)
            .send({ error: `Context credential not found: ${ctxId}` });
        }
        if (!ctxVerif || ctxVerif.verified !== true) {
          return reply
            .status(400)
            .send({ error: `Context credential not verified: ${ctxId}` });
        }
        const data = await ipfs.get(ctxCred.credentialSubject.content);
        if (!data)
          return reply
            .status(400)
            .send({ error: `Context credential not found in IPFS: ${ctxId}` });
        context.push(data);
      }

      // if there is context, evaulate new content as cliams within context
      if (context.length > 0) {
        const credible = await ai.evaluateContent(attributes.content, context);
        console.log('AI eval', credible);
        // NOTE: don't worry about ambiguous (3) for now
        if (credible === 0)
          return reply
            .status(400)
            .send({ error: 'Content is not credible within the context' });
      }

      const alias = opts?.generateAlias ? nanoid() : undefined;
      const id = `urn:uuid:${crypto.randomUUID()}`;

      // Upload content to IPFS and get CID
      const cid = await ipfs.put(id, attributes.content);
      console.log('IPFS CID', cid);
      if (!cid)
        return reply
          .status(500)
          .send({ error: 'Failed to upload content to IPFS' });

      const credential = await issueCredential({
        id,
        issuerDid: issuer.did,
        subjectDid,
        attributes: {
          ...attributes,
          content: cid,
          alias,
        },
      });

      await db.setCred(id, credential, subjectDid);
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
      return await db.getCredsByHolder(did);
    } catch (error: any) {
      fastify.log.error(error);
      return reply
        .status(500)
        .send({ error: error.message || 'Internal server error' });
    }
  });

  // Retrieve a credential by its id or alias
  fastify.get('/credential/:id', async function (request, reply) {
    const { id } = request.params as { id: string };
    if (!id) return reply.status(400).send({ error: 'Missing identifier' });

    try {
      const cred = await db.getCred(id);
      if (!cred)
        return reply.status(404).send({ error: 'Credential not found' });
      return cred;
    } catch (error: any) {
      fastify.log.error(error);
      return reply
        .status(500)
        .send({ error: error.message || 'Internal server error' });
    }
  });

  // Verify a credential by its id or alias
  fastify.get('/credential/verify/:id', async function (request, reply) {
    const { id } = request.params as { id: string };
    if (!id) return reply.status(400).send({ error: 'Missing identifier' });

    try {
      const { cred, verif } = await getOrVerifyCredential(id);
      if (!cred)
        return reply.status(404).send({ error: 'Credential not found' });
      return verif;
    } catch (error: any) {
      fastify.log.error(error);
      return reply
        .status(500)
        .send({ error: error.message || 'Internal server error' });
    }
  });
};

export default credential;
