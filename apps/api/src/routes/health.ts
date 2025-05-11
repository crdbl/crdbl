import { FastifyPluginAsync } from 'fastify';
import { createClient } from 'redis';
import { REDIS_URL } from '../config.js';

const redis = createClient({ url: REDIS_URL });

const health: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get('/health', async function (_request, reply) {
    try {
      if (!redis.isOpen) await redis.connect();
      await redis.ping();
      return { status: 'ok' };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(503).send({
        status: 'error',
        message: 'DB connection failed',
      });
    }
  });
};

export default health;
