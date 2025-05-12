import fp from 'fastify-plugin';

export interface SupportPluginOptions {
  // Specify Support plugin options here
  enabled?: boolean;
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  if (opts.enabled === false) {
    fastify.log.info('Support plugin is disabled, skipping initialization');
    return;
  }

  fastify.decorate('someSupport', function () {
    return 'hugs';
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    someSupport(): string;
  }
}
