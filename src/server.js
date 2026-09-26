const { createApp } = require('./app');
const logger = require('./logger');
const { createMemoryRepository } = require('./tasks/memoryRepository');
const { createPgRepository } = require('./tasks/pgRepository');

async function main() {
  let repo;
  if (process.env.DATABASE_URL) {
    repo = createPgRepository(process.env.DATABASE_URL);
    await repo.init();
    logger.info('using postgres repository');
  } else {
    repo = createMemoryRepository();
    logger.warn('DATABASE_URL not set, using in-memory repository');
  }
  const port = Number(process.env.PORT) || 3000;
  createApp({ repo, logger }).listen(port, () => logger.info({ port }, 'server started'));
}

main().catch((err) => {
  logger.fatal({ err }, 'startup failed');
  process.exit(1);
});
