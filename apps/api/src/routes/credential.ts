import { FastifyPluginAsync } from 'fastify';
import { customAlphabet } from 'nanoid';
import { nolookalikesSafe } from 'nanoid-dictionary';
import { CrdblCredentialIssueRequest, verifyHolderDid } from '@crdbl/utils';
import { issueCredential, verifyCredential } from '../services/cheqd-studio.js';
import db from '../services/db.js';

const nanoid = (length = 10): string =>
  customAlphabet(nolookalikesSafe, length)();

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
      typeof attributes.content !== 'string'
    ) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }
    try {
      const issuer = await db.getIssuer();
      if (!issuer)
        return reply.status(500).send({ error: 'Issuer DID not found' });

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
      const cred = await db.getCred(id);
      if (!cred)
        return reply.status(404).send({ error: 'Credential not found' });

      // Check if the verification result is already cached
      let verif = await db.getVerification(id);
      if (verif) return verif;

      // Verify the credential using cheqd-studio
      verif = await verifyCredential(cred.proof.jwt);

      // Cache the verification result
      await db.setVerification(id, verif);

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
