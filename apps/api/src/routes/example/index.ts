import { FastifyPluginAsync } from 'fastify';

const example: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get('/', async function (_request, _reply) {
    return 'this is an example';
  });
};

export default example;
