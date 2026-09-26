const express = require('express');
const service = require('./tasks/service');

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) throw new service.ValidationError('id must be a positive integer');
  return id;
}

function parseDone(raw) {
  if (raw === undefined) return undefined;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  throw new service.ValidationError('done must be true or false');
}

function createApp({ repo, logger }) {
  const app = express();
  app.use(express.json());

  app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      logger.info(
        {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Number(process.hrtime.bigint() - start) / 1e6,
        },
        'request',
      );
    });
    next();
  });

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.get('/tasks', async (req, res) => {
    res.json(await service.listTasks(repo, { done: parseDone(req.query.done) }));
  });

  app.post('/tasks', async (req, res) => {
    res.status(201).json(await service.createTask(repo, req.body ?? {}));
  });

  app.patch('/tasks/:id', async (req, res) => {
    const task = await service.updateTask(repo, parseId(req.params.id), req.body ?? {});
    if (!task) return res.status(404).json({ error: 'task not found' });
    return res.json(task);
  });

  app.delete('/tasks/:id', async (req, res) => {
    const removed = await service.deleteTask(repo, parseId(req.params.id));
    if (!removed) return res.status(404).json({ error: 'task not found' });
    return res.status(204).end();
  });

  app.get('/stats', async (req, res) => {
    res.json(await service.countByStatus(repo));
  });

  // Express recognises an error handler by its 4 parameters, so `next` must stay.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof service.ValidationError) return res.status(400).json({ error: err.message });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'invalid JSON body' });
    logger.error({ err }, 'unhandled error');
    return res.status(500).json({ error: 'internal error' });
  });

  return app;
}

module.exports = { createApp };
