import { FastifyPluginAsync } from 'fastify';
import db from '../services/db.js';

const health: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get('/health', async function (_request, reply) {
    try {
      await db.health();
      return { status: 'ok' };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(503).send({
        status: 'error',
        message: 'health check failed',
      });
    }
  });
};

export default health;
