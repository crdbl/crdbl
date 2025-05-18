import { FastifyPluginAsync } from 'fastify';
import db from '../services/db.js';
import ipfs from '../services/ipfs.js';

const health: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get(
    '/health',
    { logLevel: 'warn' }, // reduce noisy logs
    async function (_request, reply) {
      try {
        await Promise.all([db.health(), ipfs.health()]);
        return { status: 'ok' };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(503).send({
          status: 'error',
          message: 'health check failed',
        });
      }
    }
  );
};

export default health;
